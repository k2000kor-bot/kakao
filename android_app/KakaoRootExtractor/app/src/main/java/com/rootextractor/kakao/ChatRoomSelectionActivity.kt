package com.rootextractor.kakao

import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.os.Bundle
import android.util.Log
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.*
import org.json.JSONObject
import java.io.File

data class ChatRoomItem(
    val roomId: String,
    val roomName: String,
    val roomType: String,
    val participantCount: Int,
    val lastActivity: String,
    val messageCount: Int,
    var isSelected: Boolean = false
)

class ChatRoomSelectionActivity : AppCompatActivity() {
    
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ChatRoomAdapter
    private lateinit var selectAllButton: Button
    private lateinit var confirmButton: Button
    private lateinit var cancelButton: Button
    private lateinit var statusText: TextView
    
    private val chatRooms = mutableListOf<ChatRoomItem>()
    private val kakaoDbPath = "/data/data/com.kakao.talk/databases/KakaoTalk.db"
    
    companion object {
        private const val TAG = "ChatRoomSelection"
        const val RESULT_SELECTED_ROOMS = "selected_rooms"
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chatroom_selection)
        
        initViews()
        setupRecyclerView()
        loadChatRooms()
    }
    
    private fun initViews() {
        recyclerView = findViewById(R.id.chatRoomsRecyclerView)
        selectAllButton = findViewById(R.id.selectAllButton)
        confirmButton = findViewById(R.id.confirmButton)
        cancelButton = findViewById(R.id.cancelButton)
        statusText = findViewById(R.id.statusText)
        
        selectAllButton.setOnClickListener { toggleSelectAll() }
        confirmButton.setOnClickListener { confirmSelection() }
        cancelButton.setOnClickListener { finish() }
    }
    
    private fun setupRecyclerView() {
        adapter = ChatRoomAdapter(chatRooms) { position ->
            chatRooms[position].isSelected = !chatRooms[position].isSelected
            adapter.notifyItemChanged(position)
            updateConfirmButton()
        }
        
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
    }
    
    private fun loadChatRooms() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                updateStatus("📊 대화방 목록 로딩 중...")
                
                val rooms = extractChatRoomsFromDB()
                
                withContext(Dispatchers.Main) {
                    chatRooms.clear()
                    chatRooms.addAll(rooms)
                    adapter.notifyDataSetChanged()
                    updateStatus("✅ ${rooms.size}개 대화방 로딩 완료")
                    updateConfirmButton()
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "대화방 로딩 실패", e)
                withContext(Dispatchers.Main) {
                    updateStatus("❌ 대화방 로딩 실패: ${e.message}")
                }
            }
        }
    }
    
    private fun extractChatRoomsFromDB(): List<ChatRoomItem> {
        val rooms = mutableListOf<ChatRoomItem>()
        
        try {
            // 루트 권한으로 데이터베이스 복사
            val tempDbPath = copyDatabaseWithRoot(kakaoDbPath)
            
            SQLiteDatabase.openDatabase(tempDbPath, null, SQLiteDatabase.OPEN_READONLY).use { db ->
                val cursor = db.rawQuery("""
                    SELECT 
                        ocl.id as room_id,
                        ocl.nickname as room_name,
                        ocl.type as room_type,
                        ocl.member_count as participant_count,
                        COUNT(cl._id) as message_count,
                        MAX(cl.created_at) as last_activity
                    FROM open_chat_link ocl
                    LEFT JOIN chat_logs cl ON ocl.id = cl.chat_id
                    GROUP BY ocl.id, ocl.nickname, ocl.type, ocl.member_count
                    ORDER BY last_activity DESC
                """, null)
                
                while (cursor.moveToNext()) {
                    val roomType = when(cursor.getInt(2)) {
                        1 -> "개인 대화"
                        2 -> "그룹 대화"
                        3 -> "오픈 대화"
                        else -> "기타"
                    }
                    
                    val lastActivity = cursor.getLong(5)
                    val timeAgo = getTimeAgo(lastActivity)
                    
                    val room = ChatRoomItem(
                        roomId = cursor.getString(0) ?: "",
                        roomName = cursor.getString(1) ?: "이름 없음",
                        roomType = roomType,
                        participantCount = cursor.getInt(3),
                        lastActivity = timeAgo,
                        messageCount = cursor.getInt(4),
                        isSelected = true // 기본적으로 모든 방 선택
                    )
                    rooms.add(room)
                }
                cursor.close()
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "DB에서 대화방 추출 실패", e)
        }
        
        return rooms
    }
    
    private fun copyDatabaseWithRoot(originalPath: String): String {
        val tempPath = "${cacheDir.absolutePath}/temp_chatrooms.db"
        
        try {
            val process = Runtime.getRuntime().exec("su")
            val writer = process.outputStream.bufferedWriter()
            
            writer.write("cp $originalPath $tempPath\n")
            writer.write("chmod 777 $tempPath\n")
            writer.write("exit\n")
            writer.flush()
            
            process.waitFor()
            
            return tempPath
        } catch (e: Exception) {
            Log.e(TAG, "DB 복사 실패", e)
            throw e
        }
    }
    
    private fun getTimeAgo(timestamp: Long): String {
        if (timestamp == 0L) return "활동 없음"
        
        val now = System.currentTimeMillis()
        val diff = now - timestamp
        
        return when {
            diff < 60 * 1000 -> "방금 전"
            diff < 60 * 60 * 1000 -> "${diff / (60 * 1000)}분 전"
            diff < 24 * 60 * 60 * 1000 -> "${diff / (60 * 60 * 1000)}시간 전"
            diff < 7 * 24 * 60 * 60 * 1000 -> "${diff / (24 * 60 * 60 * 1000)}일 전"
            else -> "오래 전"
        }
    }
    
    private fun toggleSelectAll() {
        val hasUnselected = chatRooms.any { !it.isSelected }
        
        chatRooms.forEach { it.isSelected = hasUnselected }
        adapter.notifyDataSetChanged()
        updateConfirmButton()
        
        selectAllButton.text = if (hasUnselected) "모두 해제" else "모두 선택"
    }
    
    private fun updateConfirmButton() {
        val selectedCount = chatRooms.count { it.isSelected }
        confirmButton.text = "확인 (${selectedCount}개 선택)"
        confirmButton.isEnabled = selectedCount > 0
    }
    
    private fun confirmSelection() {
        val selectedRooms = chatRooms.filter { it.isSelected }
        
        // 선택된 대화방 정보를 JSON으로 변환
        val selectedRoomsJson = selectedRooms.map { room ->
            JSONObject().apply {
                put("room_id", room.roomId)
                put("room_name", room.roomName)
                put("room_type", room.roomType)
                put("participant_count", room.participantCount)
                put("message_count", room.messageCount)
            }
        }
        
        val intent = Intent().apply {
            putExtra(RESULT_SELECTED_ROOMS, selectedRoomsJson.toString())
        }
        
        setResult(RESULT_OK, intent)
        finish()
    }
    
    private fun updateStatus(status: String) {
        runOnUiThread {
            statusText.text = status
            Log.d(TAG, status)
        }
    }
}

class ChatRoomAdapter(
    private val chatRooms: List<ChatRoomItem>,
    private val onItemClick: (Int) -> Unit
) : RecyclerView.Adapter<ChatRoomAdapter.ViewHolder>() {
    
    class ViewHolder(view: android.view.View) : RecyclerView.ViewHolder(view) {
        val checkBox: CheckBox = view.findViewById(R.id.roomCheckBox)
        val roomName: TextView = view.findViewById(R.id.roomName)
        val roomInfo: TextView = view.findViewById(R.id.roomInfo)
        val messageCount: TextView = view.findViewById(R.id.messageCount)
        val lastActivity: TextView = view.findViewById(R.id.lastActivity)
    }
    
    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_chatroom, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val room = chatRooms[position]
        
        holder.checkBox.isChecked = room.isSelected
        holder.roomName.text = room.roomName
        holder.roomInfo.text = "${room.roomType} • ${room.participantCount}명"
        holder.messageCount.text = "${room.messageCount}개 메시지"
        holder.lastActivity.text = "마지막 활동: ${room.lastActivity}"
        
        holder.itemView.setOnClickListener { onItemClick(position) }
        holder.checkBox.setOnClickListener { onItemClick(position) }
    }
    
    override fun getItemCount(): Int = chatRooms.size
} 