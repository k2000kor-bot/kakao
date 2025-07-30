package com.rootextractor.kakao

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.database.sqlite.SQLiteDatabase
import android.os.Bundle
import android.os.FileObserver
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.IOException

class MainActivity : AppCompatActivity() {
    
    private lateinit var statusText: TextView
    private lateinit var startButton: Button
    private lateinit var stopButton: Button
    private lateinit var syncButton: Button
    private lateinit var selectRoomsButton: Button
    private lateinit var selectedRoomsText: TextView
    
    private var fileObserver: FileObserver? = null
    private var isMonitoring = false
    private val httpClient = OkHttpClient()
    
    private var selectedChatRooms: List<String> = emptyList() // 선택된 대화방 ID 목록
    
    // 카카오톡 데이터베이스 경로
    private val kakaoDbPath = "/data/data/com.kakao.talk/databases/KakaoTalk.db"
    private val kakaoDb2Path = "/data/data/com.kakao.talk/databases/KakaoTalk2.db"
    
    // 서버 주소 (실제 PC의 IP 주소로 변경 필요)
    private val serverUrl = "http://192.168.1.100:8005"
    
    companion object {
        private const val TAG = "KakaoRootExtractor"
        private const val PERMISSION_REQUEST_CODE = 1001
        private const val CHATROOM_SELECTION_REQUEST = 2001
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        initViews()
        checkPermissions()
        checkRootAccess()
    }
    
    private fun initViews() {
        statusText = findViewById(R.id.statusText)
        startButton = findViewById(R.id.startButton)
        stopButton = findViewById(R.id.stopButton)
        syncButton = findViewById(R.id.syncButton)
        selectRoomsButton = findViewById(R.id.selectRoomsButton)
        selectedRoomsText = findViewById(R.id.selectedRoomsText)
        
        startButton.setOnClickListener { startMonitoring() }
        stopButton.setOnClickListener { stopMonitoring() }
        syncButton.setOnClickListener { syncAllData() }
        selectRoomsButton.setOnClickListener { openChatRoomSelection() }
        
        updateStatus("앱 초기화 완료")
    }
    
    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.INTERNET
        )
        
        val permissionsToRequest = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        
        if (permissionsToRequest.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this, 
                permissionsToRequest.toTypedArray(), 
                PERMISSION_REQUEST_CODE
            )
        }
    }
    
    private fun checkRootAccess(): Boolean {
        return try {
            val process = Runtime.getRuntime().exec("su")
            process.outputStream.write("exit\n".toByteArray())
            process.outputStream.flush()
            process.waitFor() == 0
        } catch (e: Exception) {
            Log.e(TAG, "루트 권한 확인 실패", e)
            updateStatus("❌ 루트 권한이 필요합니다!")
            false
        }
    }
    
    private fun startMonitoring() {
        if (!checkRootAccess()) {
            Toast.makeText(this, "루트 권한이 필요합니다", Toast.LENGTH_LONG).show()
            return
        }
        
        if (isMonitoring) {
            Toast.makeText(this, "이미 모니터링 중입니다", Toast.LENGTH_SHORT).show()
            return
        }
        
        try {
            // 카카오톡 데이터베이스 폴더 모니터링 시작
            val dbFolder = File(kakaoDbPath).parent
            fileObserver = object : FileObserver(dbFolder, MODIFY) {
                override fun onEvent(event: Int, path: String?) {
                    if (path != null && (path.contains("KakaoTalk") && path.endsWith(".db"))) {
                        Log.d(TAG, "카카오톡 DB 변화 감지: $path")
                        extractNewMessages()
                    }
                }
            }
            
            fileObserver?.startWatching()
            isMonitoring = true
            updateStatus("✅ 실시간 모니터링 시작됨")
            
            // 초기 데이터 추출
            extractAllData()
            
        } catch (e: Exception) {
            Log.e(TAG, "모니터링 시작 실패", e)
            updateStatus("❌ 모니터링 시작 실패: ${e.message}")
        }
    }
    
    private fun stopMonitoring() {
        fileObserver?.stopWatching()
        fileObserver = null
        isMonitoring = false
        updateStatus("⏹️ 모니터링 중지됨")
    }
    
    private fun extractAllData() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                updateStatus("📊 전체 데이터 추출 중...")
                
                // 채팅방 정보 추출
                val chatRooms = extractChatRooms()
                if (chatRooms.isNotEmpty()) {
                    sendChatRoomsToServer(chatRooms)
                }
                
                // 메시지 추출 (선택된 대화방만)
                val messages = if (selectedChatRooms.isEmpty()) {
                    extractMessages() // 전체 대화방
                } else {
                    extractMessages(selectedRooms = selectedChatRooms) // 선택된 대화방만
                }
                if (messages.isNotEmpty()) {
                    sendMessagesToServer(messages)
                }
                
                withContext(Dispatchers.Main) {
                    val roomFilter = if (selectedChatRooms.isEmpty()) "전체" else "${selectedChatRooms.size}개 선택된"
                    updateStatus("✅ 전체 데이터 추출 완료 (채팅방: ${chatRooms.size}, 메시지: ${messages.size}, $roomFilter 대화방)")
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "데이터 추출 실패", e)
                withContext(Dispatchers.Main) {
                    updateStatus("❌ 데이터 추출 실패: ${e.message}")
                }
            }
        }
    }
    
    private fun extractNewMessages() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // 최근 5분 내의 새 메시지만 추출 (선택된 대화방만)
                val messages = if (selectedChatRooms.isEmpty()) {
                    extractMessages(limitMinutes = 5) // 전체 대화방
                } else {
                    extractMessages(limitMinutes = 5, selectedRooms = selectedChatRooms) // 선택된 대화방만
                }
                
                if (messages.isNotEmpty()) {
                    sendMessagesToServer(messages)
                    withContext(Dispatchers.Main) {
                        val roomFilter = if (selectedChatRooms.isEmpty()) "전체" else "${selectedChatRooms.size}개 선택된"
                        updateStatus("🔄 새 메시지 ${messages.size}개 추출됨 ($roomFilter 대화방)")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "새 메시지 추출 실패", e)
            }
        }
    }
    
    private fun extractChatRooms(): List<JSONObject> {
        val chatRooms = mutableListOf<JSONObject>()
        
        try {
            // 루트 권한으로 데이터베이스 복사
            val tempDbPath = copyDatabaseWithRoot(kakaoDbPath)
            
            SQLiteDatabase.openDatabase(tempDbPath, null, SQLiteDatabase.OPEN_READONLY).use { db ->
                val cursor = db.rawQuery("""
                    SELECT 
                        id as room_id,
                        nickname as room_name,
                        type as room_type,
                        member_count as participant_count,
                        members as participants,
                        last_message_id,
                        last_seen_log_id,
                        profile_image_url,
                        created_at
                    FROM open_chat_link 
                    ORDER BY last_seen_log_id DESC
                """, null)
                
                while (cursor.moveToNext()) {
                    val participants = parseParticipants(cursor.getString(4) ?: "")
                    val roomHash = generateRoomHash(participants)
                    
                    val chatRoom = JSONObject().apply {
                        put("room_id", cursor.getString(0) ?: "")
                        put("room_name", cursor.getString(1) ?: "Unknown")
                        put("room_type", when(cursor.getInt(2)) {
                            1 -> "direct"
                            2 -> "group" 
                            3 -> "openchat"
                            else -> "unknown"
                        })
                        put("participant_count", cursor.getInt(3))
                        put("participants", participants)
                        put("room_hash", roomHash)
                        put("profile_image_url", cursor.getString(7) ?: "")
                        put("created_at", cursor.getLong(8))
                        put("last_message_time", System.currentTimeMillis())
                    }
                    chatRooms.add(chatRoom)
                }
                cursor.close()
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "채팅방 추출 실패", e)
        }
        
        return chatRooms
    }
    
    private fun extractMessages(limitMinutes: Int? = null, selectedRooms: List<String>? = null): List<JSONObject> {
        val messages = mutableListOf<JSONObject>()
        
        try {
            // 루트 권한으로 데이터베이스 복사
            val tempDbPath = copyDatabaseWithRoot(kakaoDbPath)
            
            SQLiteDatabase.openDatabase(tempDbPath, null, SQLiteDatabase.OPEN_READONLY).use { db ->
                
                val timeFilter = if (limitMinutes != null) {
                    val cutoffTime = System.currentTimeMillis() - (limitMinutes * 60 * 1000)
                    "AND cl.created_at > $cutoffTime"
                } else ""
                
                val roomFilter = if (!selectedRooms.isNullOrEmpty()) {
                    val roomIds = selectedRooms.joinToString(",") { "'$it'" }
                    "AND cl.chat_id IN ($roomIds)"
                } else ""
                
                val cursor = db.rawQuery("""
                    SELECT 
                        cl._id as message_id,
                        cl.chat_id as chat_room_id,
                        cl.user_id as sender_id,
                        cl.nickname as sender_name,
                        cl.message as content,
                        cl.type as message_type,
                        cl.created_at as timestamp,
                        (cl.user_id = (SELECT user_id FROM open_profile WHERE is_user = 1 LIMIT 1)) as is_sent_by_me,
                        cl.attachment as attachment_path,
                        op.phone_number as sender_phone,
                        op.profile_image_url as sender_profile_image,
                        ocl.nickname as room_name,
                        ocl.type as room_type
                    FROM chat_logs cl
                    LEFT JOIN open_profile op ON cl.user_id = op.user_id
                    LEFT JOIN open_chat_link ocl ON cl.chat_id = ocl.id
                    WHERE cl.message IS NOT NULL 
                    $timeFilter
                    $roomFilter
                    ORDER BY cl.created_at ASC
                """, null)
                
                while (cursor.moveToNext()) {
                    val senderId = cursor.getString(2) ?: ""
                    val senderName = cursor.getString(3) ?: "Unknown"
                    val roomId = cursor.getString(1) ?: ""
                    val roomName = cursor.getString(11) ?: "Unknown"
                    
                    // 사용자 고유 식별자 생성
                    val userHash = generateUserHash(senderId, senderName, cursor.getString(9))
                    
                    val message = JSONObject().apply {
                        put("message_id", cursor.getString(0) ?: "")
                        put("chat_room_id", roomId)
                        put("sender_id", senderId)
                        put("sender_name", senderName)
                        put("sender_hash", userHash)
                        put("sender_phone_hash", hashPhone(cursor.getString(9)))
                        put("sender_profile_image", cursor.getString(10) ?: "")
                        put("content", cursor.getString(4) ?: "")
                        put("message_type", getMessageType(cursor.getInt(5)))
                        put("timestamp", cursor.getLong(6))
                        put("is_sent_by_me", cursor.getInt(7) == 1)
                        put("attachment_path", cursor.getString(8) ?: "")
                        put("attachment_type", getAttachmentType(cursor.getString(8)))
                        put("room_name", roomName)
                        put("room_type", when(cursor.getInt(12)) {
                            1 -> "direct"
                            2 -> "group"
                            3 -> "openchat"
                            else -> "unknown"
                        })
                        put("context_hash", generateContextHash(roomId, senderId, senderName))
                    }
                    messages.add(message)
                }
                cursor.close()
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "메시지 추출 실패", e)
        }
        
        return messages
    }
    
    private fun copyDatabaseWithRoot(originalPath: String): String {
        val tempPath = "${cacheDir.absolutePath}/temp_kakao.db"
        
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
    
    private fun parseParticipants(participantsStr: String): JSONArray {
        val participants = JSONArray()
        try {
            // 카카오톡 참여자 정보 파싱 (실제 형식에 맞게 수정 필요)
            participantsStr.split(",").forEach { participant ->
                if (participant.isNotBlank()) {
                    participants.put(participant.trim())
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "참여자 파싱 실패", e)
        }
        return participants
    }
    
    private fun getMessageType(type: Int): String {
        return when (type) {
            1 -> "text"
            2 -> "image"
            3 -> "video"
            4 -> "audio"
            5 -> "file"
            18 -> "emoticon"
            26 -> "reply"
            else -> "unknown"
        }
    }
    
    private fun getAttachmentType(attachmentPath: String?): String? {
        if (attachmentPath.isNullOrEmpty()) return null
        
        return when {
            attachmentPath.contains(".jpg") || attachmentPath.contains(".png") -> "image"
            attachmentPath.contains(".mp4") || attachmentPath.contains(".avi") -> "video"
            attachmentPath.contains(".mp3") || attachmentPath.contains(".wav") -> "audio"
            else -> "file"
        }
    }
    
    private fun generateUserHash(userId: String, nickname: String, phoneNumber: String?): String {
        val combined = "$userId:$nickname:${phoneNumber ?: ""}"
        return combined.hashCode().toString().takeLast(8)
    }
    
    private fun generateRoomHash(participants: JSONArray): String {
        val participantsList = mutableListOf<String>()
        for (i in 0 until participants.length()) {
            participantsList.add(participants.getString(i))
        }
        participantsList.sort()
        return participantsList.joinToString(",").hashCode().toString().takeLast(8)
    }
    
    private fun generateContextHash(roomId: String, userId: String, nickname: String): String {
        val context = "$roomId:$userId:$nickname"
        return context.hashCode().toString().takeLast(12)
    }
    
    private fun hashPhone(phoneNumber: String?): String? {
        if (phoneNumber.isNullOrEmpty()) return null
        return phoneNumber.hashCode().toString().takeLast(8)
    }
    
    private suspend fun sendMessagesToServer(messages: List<JSONObject>) {
        try {
            val jsonArray = JSONArray()
            messages.forEach { jsonArray.put(it) }
            
            val requestBody = jsonArray.toString()
                .toRequestBody("application/json".toMediaType())
            
            val request = Request.Builder()
                .url("$serverUrl/api/rooted/messages/bulk")
                .post(requestBody)
                .build()
            
            httpClient.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    Log.e(TAG, "메시지 전송 실패", e)
                }
                
                override fun onResponse(call: Call, response: Response) {
                    if (response.isSuccessful) {
                        Log.d(TAG, "메시지 전송 성공: ${messages.size}개")
                    } else {
                        Log.e(TAG, "메시지 전송 실패: ${response.code}")
                    }
                }
            })
            
        } catch (e: Exception) {
            Log.e(TAG, "메시지 전송 오류", e)
        }
    }
    
    private suspend fun sendChatRoomsToServer(chatRooms: List<JSONObject>) {
        try {
            val jsonArray = JSONArray()
            chatRooms.forEach { jsonArray.put(it) }
            
            val requestBody = jsonArray.toString()
                .toRequestBody("application/json".toMediaType())
            
            val request = Request.Builder()
                .url("$serverUrl/api/rooted/chatrooms/bulk")
                .post(requestBody)
                .build()
            
            httpClient.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    Log.e(TAG, "채팅방 전송 실패", e)
                }
                
                override fun onResponse(call: Call, response: Response) {
                    if (response.isSuccessful) {
                        Log.d(TAG, "채팅방 전송 성공: ${chatRooms.size}개")
                    } else {
                        Log.e(TAG, "채팅방 전송 실패: ${response.code}")
                    }
                }
            })
            
        } catch (e: Exception) {
            Log.e(TAG, "채팅방 전송 오류", e)
        }
    }
    
    private fun syncAllData() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                updateStatus("🔄 서버와 동기화 중...")
                
                val request = Request.Builder()
                    .url("$serverUrl/api/rooted/sync-with-main-system")
                    .post("{}".toRequestBody("application/json".toMediaType()))
                    .build()
                
                val response = httpClient.newCall(request).execute()
                
                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        updateStatus("✅ 서버 동기화 완료")
                    } else {
                        updateStatus("❌ 서버 동기화 실패: ${response.code}")
                    }
                }
                
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    updateStatus("❌ 동기화 오류: ${e.message}")
                }
            }
        }
    }
    
    private fun updateStatus(status: String) {
        runOnUiThread {
            statusText.text = status
            Log.d(TAG, status)
        }
    }
    
    private fun openChatRoomSelection() {
        val intent = Intent(this, ChatRoomSelectionActivity::class.java)
        startActivityForResult(intent, CHATROOM_SELECTION_REQUEST)
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == CHATROOM_SELECTION_REQUEST && resultCode == RESULT_OK) {
            data?.getStringExtra(ChatRoomSelectionActivity.RESULT_SELECTED_ROOMS)?.let { selectedRoomsJson ->
                try {
                    val selectedRoomsArray = JSONArray(selectedRoomsJson)
                    val roomIds = mutableListOf<String>()
                    val roomNames = mutableListOf<String>()
                    
                    for (i in 0 until selectedRoomsArray.length()) {
                        val room = selectedRoomsArray.getJSONObject(i)
                        roomIds.add(room.getString("room_id"))
                        roomNames.add(room.getString("room_name"))
                    }
                    
                    selectedChatRooms = roomIds
                    
                    // UI 업데이트
                    updateSelectedRoomsDisplay(roomNames)
                    
                    Log.d(TAG, "선택된 대화방: ${roomIds.size}개")
                    
                } catch (e: Exception) {
                    Log.e(TAG, "선택된 대화방 파싱 실패", e)
                    updateStatus("❌ 대화방 선택 처리 실패")
                }
            }
        }
    }
    
    private fun updateSelectedRoomsDisplay(roomNames: List<String>) {
        val displayText = if (roomNames.isEmpty()) {
            "선택된 대화방: 전체 (자동 감지)"
        } else if (roomNames.size <= 3) {
            "선택된 대화방: ${roomNames.joinToString(", ")}"
        } else {
            "선택된 대화방: ${roomNames.take(2).joinToString(", ")} 외 ${roomNames.size - 2}개"
        }
        
        selectedRoomsText.text = displayText
        selectRoomsButton.text = "📋 대화방 목록 보기 (${roomNames.size}개 선택)"
        
        updateStatus("✅ ${roomNames.size}개 대화방 선택됨")
    }
    
    override fun onDestroy() {
        super.onDestroy()
        stopMonitoring()
    }
} 