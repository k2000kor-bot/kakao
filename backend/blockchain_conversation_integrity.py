"""
블록체인 기반 대화 무결성 검증 및 NFT 증명서 시스템
- 대화 데이터 해시 체인 구현
- 분산 저장 및 검증
- NFT 기반 대화 증명서 발행
- 스마트 컨트랙트 통합
- 무결성 검증 및 감사 추적
"""

import asyncio
import json
import time
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field, asdict
from enum import Enum
import ecdsa
import base64
import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os
import sqlite3
import aiofiles
import logging
from web3 import Web3
from eth_account import Account

# 블록 타입
class BlockType(Enum):
    CONVERSATION = "conversation"
    MESSAGE = "message"
    VERIFICATION = "verification"
    CERTIFICATE = "certificate"

# 검증 상태
class VerificationStatus(Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    INVALID = "invalid"
    TAMPERED = "tampered"

@dataclass
class ConversationBlock:
    """대화 블록"""
    block_id: str
    block_type: BlockType
    timestamp: datetime
    previous_hash: str
    data: Dict[str, Any]
    digital_signature: str = ""
    merkle_root: str = ""
    nonce: int = 0
    hash: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["timestamp"] = self.timestamp.isoformat()
        data["block_type"] = self.block_type.value
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ConversationBlock':
        data["timestamp"] = datetime.fromisoformat(data["timestamp"])
        data["block_type"] = BlockType(data["block_type"])
        return cls(**data)

@dataclass
class MessageData:
    """메시지 데이터"""
    message_id: str
    sender: str
    content: str
    timestamp: datetime
    message_type: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    attachments: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["timestamp"] = self.timestamp.isoformat()
        return data

@dataclass
class ConversationChain:
    """대화 체인"""
    chain_id: str
    chat_room_id: str
    genesis_hash: str
    current_hash: str
    block_count: int
    participants: List[str]
    creation_time: datetime
    last_update: datetime
    verification_status: VerificationStatus = VerificationStatus.PENDING
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["creation_time"] = self.creation_time.isoformat()
        data["last_update"] = self.last_update.isoformat()
        data["verification_status"] = self.verification_status.value
        return data

@dataclass
class NFTCertificate:
    """NFT 증명서"""
    certificate_id: str
    chain_id: str
    token_id: int
    contract_address: str
    owner_address: str
    metadata_uri: str
    creation_time: datetime
    verification_hash: str
    attributes: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["creation_time"] = self.creation_time.isoformat()
        return data

class CryptographicUtils:
    """암호화 유틸리티"""
    
    @staticmethod
    def generate_key_pair() -> tuple:
        """RSA 키 쌍 생성"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()
        
        return private_key, public_key
    
    @staticmethod
    def sign_data(data: str, private_key) -> str:
        """데이터 서명"""
        signature = private_key.sign(
            data.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return base64.b64encode(signature).decode()
    
    @staticmethod
    def verify_signature(data: str, signature: str, public_key) -> bool:
        """서명 검증"""
        try:
            public_key.verify(
                base64.b64decode(signature),
                data.encode(),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except Exception:
            return False
    
    @staticmethod
    def calculate_hash(data: str) -> str:
        """SHA-256 해시 계산"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    @staticmethod
    def calculate_merkle_root(hashes: List[str]) -> str:
        """머클 루트 계산"""
        if not hashes:
            return ""
        
        if len(hashes) == 1:
            return hashes[0]
        
        # 홀수 개수인 경우 마지막 해시 복제
        if len(hashes) % 2 != 0:
            hashes.append(hashes[-1])
        
        new_hashes = []
        for i in range(0, len(hashes), 2):
            combined = hashes[i] + hashes[i + 1]
            new_hashes.append(CryptographicUtils.calculate_hash(combined))
        
        return CryptographicUtils.calculate_merkle_root(new_hashes)

class ProofOfWork:
    """작업 증명"""
    
    @staticmethod
    def mine_block(block: ConversationBlock, difficulty: int = 4) -> ConversationBlock:
        """블록 마이닝"""
        target = "0" * difficulty
        
        while True:
            block_data = json.dumps(block.to_dict(), sort_keys=True)
            block_hash = CryptographicUtils.calculate_hash(f"{block_data}{block.nonce}")
            
            if block_hash.startswith(target):
                block.hash = block_hash
                break
            
            block.nonce += 1
        
        return block
    
    @staticmethod
    def verify_proof_of_work(block: ConversationBlock, difficulty: int = 4) -> bool:
        """작업 증명 검증"""
        target = "0" * difficulty
        block_data = json.dumps(block.to_dict(), sort_keys=True)
        calculated_hash = CryptographicUtils.calculate_hash(f"{block_data}{block.nonce}")
        
        return calculated_hash.startswith(target) and calculated_hash == block.hash

class ConversationBlockchain:
    """대화 블록체인"""
    
    def __init__(self, db_path: str = "conversation_blockchain.db"):
        self.db_path = db_path
        self.chains: Dict[str, ConversationChain] = {}
        self.blocks: Dict[str, List[ConversationBlock]] = {}
        self.private_key, self.public_key = CryptographicUtils.generate_key_pair()
        self.difficulty = 4
        self.init_database()
    
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 체인 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversation_chains (
                chain_id TEXT PRIMARY KEY,
                chat_room_id TEXT,
                genesis_hash TEXT,
                current_hash TEXT,
                block_count INTEGER,
                participants TEXT,
                creation_time TEXT,
                last_update TEXT,
                verification_status TEXT
            )
        """)
        
        # 블록 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversation_blocks (
                block_id TEXT PRIMARY KEY,
                chain_id TEXT,
                block_type TEXT,
                timestamp TEXT,
                previous_hash TEXT,
                data TEXT,
                digital_signature TEXT,
                merkle_root TEXT,
                nonce INTEGER,
                hash TEXT,
                FOREIGN KEY (chain_id) REFERENCES conversation_chains (chain_id)
            )
        """)
        
        # 증명서 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS nft_certificates (
                certificate_id TEXT PRIMARY KEY,
                chain_id TEXT,
                token_id INTEGER,
                contract_address TEXT,
                owner_address TEXT,
                metadata_uri TEXT,
                creation_time TEXT,
                verification_hash TEXT,
                attributes TEXT,
                FOREIGN KEY (chain_id) REFERENCES conversation_chains (chain_id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    async def create_conversation_chain(self, chat_room_id: str, 
                                      participants: List[str]) -> str:
        """대화 체인 생성"""
        try:
            chain_id = str(uuid.uuid4())
            
            # 제네시스 블록 생성
            genesis_block = ConversationBlock(
                block_id=str(uuid.uuid4()),
                block_type=BlockType.CONVERSATION,
                timestamp=datetime.now(),
                previous_hash="0",
                data={
                    "chat_room_id": chat_room_id,
                    "participants": participants,
                    "action": "chain_created"
                }
            )
            
            # 머클 루트 계산
            genesis_block.merkle_root = CryptographicUtils.calculate_merkle_root([
                CryptographicUtils.calculate_hash(json.dumps(genesis_block.data))
            ])
            
            # 디지털 서명
            block_data = json.dumps(genesis_block.to_dict(), sort_keys=True)
            genesis_block.digital_signature = CryptographicUtils.sign_data(
                block_data, self.private_key
            )
            
            # 작업 증명
            genesis_block = ProofOfWork.mine_block(genesis_block, self.difficulty)
            
            # 체인 생성
            chain = ConversationChain(
                chain_id=chain_id,
                chat_room_id=chat_room_id,
                genesis_hash=genesis_block.hash,
                current_hash=genesis_block.hash,
                block_count=1,
                participants=participants,
                creation_time=datetime.now(),
                last_update=datetime.now()
            )
            
            # 메모리에 저장
            self.chains[chain_id] = chain
            self.blocks[chain_id] = [genesis_block]
            
            # 데이터베이스에 저장
            await self._save_chain_to_db(chain)
            await self._save_block_to_db(chain_id, genesis_block)
            
            logging.info(f"대화 체인 생성됨: {chain_id}")
            return chain_id
            
        except Exception as e:
            logging.error(f"대화 체인 생성 오류: {e}")
            raise e
    
    async def add_message_block(self, chain_id: str, message_data: MessageData) -> str:
        """메시지 블록 추가"""
        try:
            if chain_id not in self.chains:
                raise ValueError("존재하지 않는 체인입니다")
            
            chain = self.chains[chain_id]
            previous_block = self.blocks[chain_id][-1]
            
            # 새 블록 생성
            block = ConversationBlock(
                block_id=str(uuid.uuid4()),
                block_type=BlockType.MESSAGE,
                timestamp=datetime.now(),
                previous_hash=previous_block.hash,
                data=message_data.to_dict()
            )
            
            # 머클 루트 계산
            block.merkle_root = CryptographicUtils.calculate_merkle_root([
                CryptographicUtils.calculate_hash(json.dumps(block.data))
            ])
            
            # 디지털 서명
            block_data = json.dumps(block.to_dict(), sort_keys=True)
            block.digital_signature = CryptographicUtils.sign_data(
                block_data, self.private_key
            )
            
            # 작업 증명
            block = ProofOfWork.mine_block(block, self.difficulty)
            
            # 체인에 추가
            self.blocks[chain_id].append(block)
            chain.current_hash = block.hash
            chain.block_count += 1
            chain.last_update = datetime.now()
            
            # 데이터베이스에 저장
            await self._save_chain_to_db(chain)
            await self._save_block_to_db(chain_id, block)
            
            logging.info(f"메시지 블록 추가됨: {block.block_id}")
            return block.block_id
            
        except Exception as e:
            logging.error(f"메시지 블록 추가 오류: {e}")
            raise e
    
    async def verify_chain_integrity(self, chain_id: str) -> Dict[str, Any]:
        """체인 무결성 검증"""
        try:
            if chain_id not in self.chains:
                return {"valid": False, "error": "존재하지 않는 체인입니다"}
            
            blocks = self.blocks[chain_id]
            chain = self.chains[chain_id]
            
            verification_result = {
                "valid": True,
                "chain_id": chain_id,
                "total_blocks": len(blocks),
                "verified_blocks": 0,
                "errors": [],
                "integrity_score": 0.0
            }
            
            for i, block in enumerate(blocks):
                block_valid = True
                
                # 제네시스 블록 검증
                if i == 0:
                    if block.previous_hash != "0":
                        verification_result["errors"].append(
                            f"블록 {i}: 잘못된 제네시스 블록"
                        )
                        block_valid = False
                else:
                    # 이전 해시 검증
                    if block.previous_hash != blocks[i-1].hash:
                        verification_result["errors"].append(
                            f"블록 {i}: 이전 해시 불일치"
                        )
                        block_valid = False
                
                # 작업 증명 검증
                if not ProofOfWork.verify_proof_of_work(block, self.difficulty):
                    verification_result["errors"].append(
                        f"블록 {i}: 작업 증명 실패"
                    )
                    block_valid = False
                
                # 디지털 서명 검증
                block_data = json.dumps(block.to_dict(), sort_keys=True)
                if not CryptographicUtils.verify_signature(
                    block_data, block.digital_signature, self.public_key
                ):
                    verification_result["errors"].append(
                        f"블록 {i}: 디지털 서명 검증 실패"
                    )
                    block_valid = False
                
                if block_valid:
                    verification_result["verified_blocks"] += 1
            
            # 무결성 점수 계산
            verification_result["integrity_score"] = (
                verification_result["verified_blocks"] / 
                verification_result["total_blocks"]
            )
            
            # 전체 검증 결과
            verification_result["valid"] = (
                verification_result["integrity_score"] == 1.0
            )
            
            # 체인 상태 업데이트
            if verification_result["valid"]:
                chain.verification_status = VerificationStatus.VERIFIED
            else:
                chain.verification_status = VerificationStatus.TAMPERED
            
            return verification_result
            
        except Exception as e:
            logging.error(f"체인 무결성 검증 오류: {e}")
            return {"valid": False, "error": str(e)}
    
    async def _save_chain_to_db(self, chain: ConversationChain):
        """체인을 데이터베이스에 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO conversation_chains 
            (chain_id, chat_room_id, genesis_hash, current_hash, block_count,
             participants, creation_time, last_update, verification_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            chain.chain_id,
            chain.chat_room_id,
            chain.genesis_hash,
            chain.current_hash,
            chain.block_count,
            json.dumps(chain.participants),
            chain.creation_time.isoformat(),
            chain.last_update.isoformat(),
            chain.verification_status.value
        ))
        
        conn.commit()
        conn.close()
    
    async def _save_block_to_db(self, chain_id: str, block: ConversationBlock):
        """블록을 데이터베이스에 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO conversation_blocks 
            (block_id, chain_id, block_type, timestamp, previous_hash,
             data, digital_signature, merkle_root, nonce, hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            block.block_id,
            chain_id,
            block.block_type.value,
            block.timestamp.isoformat(),
            block.previous_hash,
            json.dumps(block.data),
            block.digital_signature,
            block.merkle_root,
            block.nonce,
            block.hash
        ))
        
        conn.commit()
        conn.close()

class NFTCertificateManager:
    """NFT 증명서 관리자"""
    
    def __init__(self, web3_provider_url: str = "http://localhost:8545"):
        self.web3 = Web3(Web3.HTTPProvider(web3_provider_url))
        self.account = None
        self.contract_abi = self._get_contract_abi()
        self.contract_bytecode = self._get_contract_bytecode()
        self.deployed_contracts: Dict[str, str] = {}
        
    def _get_contract_abi(self) -> List[Dict]:
        """스마트 컨트랙트 ABI"""
        return [
            {
                "inputs": [
                    {"name": "_name", "type": "string"},
                    {"name": "_symbol", "type": "string"}
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "inputs": [
                    {"name": "to", "type": "address"},
                    {"name": "tokenId", "type": "uint256"},
                    {"name": "uri", "type": "string"},
                    {"name": "verificationHash", "type": "string"}
                ],
                "name": "mintCertificate",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "tokenId", "type": "uint256"}],
                "name": "tokenURI",
                "outputs": [{"name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "tokenId", "type": "uint256"}],
                "name": "getVerificationHash",
                "outputs": [{"name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def _get_contract_bytecode(self) -> str:
        """스마트 컨트랙트 바이트코드 (간소화된 버전)"""
        return "0x608060405234801561001057600080fd5b5060405161001e61001e565b604051809103906000f08015801561003a573d6000803e3d6000fd5b50600380546001600160a01b0319166001600160a01b039092169190911790555061006e565b600061006b565b90565b6000f3fe"
    
    async def setup_account(self, private_key: str):
        """계정 설정"""
        try:
            self.account = Account.from_key(private_key)
            logging.info(f"계정 설정됨: {self.account.address}")
        except Exception as e:
            logging.error(f"계정 설정 오류: {e}")
            raise e
    
    async def deploy_certificate_contract(self, name: str, symbol: str) -> str:
        """증명서 컨트랙트 배포"""
        try:
            if not self.account:
                raise ValueError("계정이 설정되지 않았습니다")
            
            # 컨트랙트 생성
            contract = self.web3.eth.contract(
                abi=self.contract_abi,
                bytecode=self.contract_bytecode
            )
            
            # 트랜잭션 생성
            constructor_txn = contract.constructor(name, symbol).buildTransaction({
                'from': self.account.address,
                'nonce': self.web3.eth.get_transaction_count(self.account.address),
                'gas': 2000000,
                'gasPrice': self.web3.toWei('20', 'gwei')
            })
            
            # 서명 및 전송
            signed_txn = self.web3.eth.account.sign_transaction(
                constructor_txn, self.account.key
            )
            tx_hash = self.web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # 트랜잭션 확인
            tx_receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            contract_address = tx_receipt.contractAddress
            
            self.deployed_contracts[name] = contract_address
            
            logging.info(f"컨트랙트 배포됨: {contract_address}")
            return contract_address
            
        except Exception as e:
            logging.error(f"컨트랙트 배포 오류: {e}")
            raise e
    
    async def mint_conversation_certificate(self, chain_id: str, 
                                          owner_address: str,
                                          conversation_hash: str,
                                          metadata: Dict[str, Any]) -> NFTCertificate:
        """대화 증명서 NFT 발행"""
        try:
            # 메타데이터 URI 생성 (IPFS 또는 중앙 서버)
            metadata_uri = await self._upload_metadata(metadata)
            
            # 토큰 ID 생성
            token_id = int(time.time() * 1000)
            
            # 컨트랙트 인스턴스
            contract_address = list(self.deployed_contracts.values())[0] if self.deployed_contracts else None
            if not contract_address:
                raise ValueError("배포된 컨트랙트가 없습니다")
            
            contract = self.web3.eth.contract(
                address=contract_address,
                abi=self.contract_abi
            )
            
            # NFT 발행 트랜잭션
            txn = contract.functions.mintCertificate(
                owner_address,
                token_id,
                metadata_uri,
                conversation_hash
            ).buildTransaction({
                'from': self.account.address,
                'nonce': self.web3.eth.get_transaction_count(self.account.address),
                'gas': 200000,
                'gasPrice': self.web3.toWei('20', 'gwei')
            })
            
            # 서명 및 전송
            signed_txn = self.web3.eth.account.sign_transaction(txn, self.account.key)
            tx_hash = self.web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # 트랜잭션 확인
            tx_receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            # 증명서 객체 생성
            certificate = NFTCertificate(
                certificate_id=str(uuid.uuid4()),
                chain_id=chain_id,
                token_id=token_id,
                contract_address=contract_address,
                owner_address=owner_address,
                metadata_uri=metadata_uri,
                creation_time=datetime.now(),
                verification_hash=conversation_hash,
                attributes=metadata
            )
            
            logging.info(f"NFT 증명서 발행됨: {certificate.certificate_id}")
            return certificate
            
        except Exception as e:
            logging.error(f"NFT 증명서 발행 오류: {e}")
            raise e
    
    async def _upload_metadata(self, metadata: Dict[str, Any]) -> str:
        """메타데이터 업로드 (IPFS 시뮬레이션)"""
        # 실제 구현에서는 IPFS에 업로드
        metadata_json = json.dumps(metadata, ensure_ascii=False)
        metadata_hash = CryptographicUtils.calculate_hash(metadata_json)
        
        # 임시 URI (실제로는 IPFS 해시)
        return f"https://ipfs.io/ipfs/{metadata_hash}"

class DistributedVerificationNetwork:
    """분산 검증 네트워크"""
    
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.verification_requests: Dict[str, Dict[str, Any]] = {}
        self.consensus_threshold = 0.66  # 66% 합의
    
    async def register_verification_node(self, node_id: str, endpoint: str,
                                       public_key: str) -> bool:
        """검증 노드 등록"""
        try:
            self.nodes[node_id] = {
                "endpoint": endpoint,
                "public_key": public_key,
                "status": "active",
                "last_seen": datetime.now(),
                "verification_count": 0,
                "accuracy_score": 1.0
            }
            
            logging.info(f"검증 노드 등록됨: {node_id}")
            return True
            
        except Exception as e:
            logging.error(f"검증 노드 등록 오류: {e}")
            return False
    
    async def request_distributed_verification(self, chain_id: str,
                                             verification_data: Dict[str, Any]) -> str:
        """분산 검증 요청"""
        try:
            request_id = str(uuid.uuid4())
            
            self.verification_requests[request_id] = {
                "chain_id": chain_id,
                "verification_data": verification_data,
                "responses": {},
                "status": "pending",
                "created_time": datetime.now(),
                "consensus_result": None
            }
            
            # 활성 노드들에게 검증 요청 전송
            active_nodes = [
                node_id for node_id, node_data in self.nodes.items()
                if node_data["status"] == "active"
            ]
            
            tasks = []
            for node_id in active_nodes:
                task = self._send_verification_request(
                    node_id, request_id, verification_data
                )
                tasks.append(task)
            
            # 비동기 요청 전송
            await asyncio.gather(*tasks, return_exceptions=True)
            
            logging.info(f"분산 검증 요청됨: {request_id}")
            return request_id
            
        except Exception as e:
            logging.error(f"분산 검증 요청 오류: {e}")
            raise e
    
    async def _send_verification_request(self, node_id: str, request_id: str,
                                       verification_data: Dict[str, Any]):
        """개별 노드에 검증 요청 전송"""
        try:
            node = self.nodes[node_id]
            
            # HTTP 요청 전송 (실제 구현에서는 더 안전한 프로토콜 사용)
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{node['endpoint']}/verify",
                    json={
                        "request_id": request_id,
                        "verification_data": verification_data
                    },
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        await self._process_verification_response(
                            request_id, node_id, result
                        )
                    else:
                        logging.warning(f"노드 {node_id} 검증 요청 실패: {response.status}")
                        
        except Exception as e:
            logging.error(f"노드 {node_id} 검증 요청 오류: {e}")
    
    async def _process_verification_response(self, request_id: str, node_id: str,
                                          response: Dict[str, Any]):
        """검증 응답 처리"""
        try:
            if request_id not in self.verification_requests:
                return
            
            request_data = self.verification_requests[request_id]
            request_data["responses"][node_id] = {
                "result": response,
                "timestamp": datetime.now(),
                "node_accuracy": self.nodes[node_id]["accuracy_score"]
            }
            
            # 노드 메트릭스 업데이트
            self.nodes[node_id]["verification_count"] += 1
            self.nodes[node_id]["last_seen"] = datetime.now()
            
            # 합의 확인
            await self._check_consensus(request_id)
            
        except Exception as e:
            logging.error(f"검증 응답 처리 오류: {e}")
    
    async def _check_consensus(self, request_id: str):
        """합의 확인"""
        try:
            request_data = self.verification_requests[request_id]
            responses = request_data["responses"]
            
            if not responses:
                return
            
            # 가중 투표 (노드 정확도 기반)
            total_weight = 0
            positive_weight = 0
            
            for node_id, response_data in responses.items():
                node_accuracy = response_data["node_accuracy"]
                result = response_data["result"]
                
                total_weight += node_accuracy
                
                if result.get("valid", False):
                    positive_weight += node_accuracy
            
            if total_weight == 0:
                return
            
            consensus_ratio = positive_weight / total_weight
            
            # 합의 임계값 확인
            if consensus_ratio >= self.consensus_threshold:
                request_data["consensus_result"] = {
                    "valid": True,
                    "consensus_ratio": consensus_ratio,
                    "participating_nodes": len(responses)
                }
                request_data["status"] = "verified"
                
            elif consensus_ratio <= (1 - self.consensus_threshold):
                request_data["consensus_result"] = {
                    "valid": False,
                    "consensus_ratio": consensus_ratio,
                    "participating_nodes": len(responses)
                }
                request_data["status"] = "invalid"
            
            # 결과가 확정되면 로그 출력
            if request_data["status"] != "pending":
                logging.info(f"합의 완료: {request_id} - {request_data['consensus_result']}")
                
        except Exception as e:
            logging.error(f"합의 확인 오류: {e}")

class BlockchainIntegrityManager:
    """블록체인 무결성 관리자"""
    
    def __init__(self):
        self.blockchain = ConversationBlockchain()
        self.nft_manager = NFTCertificateManager()
        self.verification_network = DistributedVerificationNetwork()
        self.audit_log: List[Dict[str, Any]] = []
    
    async def initialize(self, web3_provider_url: str = None, private_key: str = None):
        """시스템 초기화"""
        if web3_provider_url:
            self.nft_manager = NFTCertificateManager(web3_provider_url)
        
        if private_key:
            await self.nft_manager.setup_account(private_key)
        
        logging.info("블록체인 무결성 관리자 초기화 완료")
    
    async def create_secure_conversation(self, chat_room_id: str,
                                       participants: List[str]) -> Dict[str, Any]:
        """보안 대화 생성"""
        try:
            # 블록체인 체인 생성
            chain_id = await self.blockchain.create_conversation_chain(
                chat_room_id, participants
            )
            
            # 감사 로그 기록
            self.audit_log.append({
                "action": "conversation_created",
                "chain_id": chain_id,
                "chat_room_id": chat_room_id,
                "participants": participants,
                "timestamp": datetime.now().isoformat()
            })
            
            return {
                "success": True,
                "chain_id": chain_id,
                "genesis_hash": self.blockchain.chains[chain_id].genesis_hash
            }
            
        except Exception as e:
            logging.error(f"보안 대화 생성 오류: {e}")
            return {"success": False, "error": str(e)}
    
    async def add_secure_message(self, chain_id: str, sender: str,
                               content: str, message_type: str = "text",
                               attachments: List[str] = None) -> Dict[str, Any]:
        """보안 메시지 추가"""
        try:
            message_data = MessageData(
                message_id=str(uuid.uuid4()),
                sender=sender,
                content=content,
                timestamp=datetime.now(),
                message_type=message_type,
                attachments=attachments or []
            )
            
            # 블록체인에 메시지 추가
            block_id = await self.blockchain.add_message_block(chain_id, message_data)
            
            # 감사 로그 기록
            self.audit_log.append({
                "action": "message_added",
                "chain_id": chain_id,
                "block_id": block_id,
                "sender": sender,
                "timestamp": datetime.now().isoformat()
            })
            
            return {
                "success": True,
                "block_id": block_id,
                "message_id": message_data.message_id
            }
            
        except Exception as e:
            logging.error(f"보안 메시지 추가 오류: {e}")
            return {"success": False, "error": str(e)}
    
    async def verify_conversation_integrity(self, chain_id: str,
                                          use_distributed_verification: bool = False) -> Dict[str, Any]:
        """대화 무결성 검증"""
        try:
            # 로컬 검증
            local_result = await self.blockchain.verify_chain_integrity(chain_id)
            
            verification_result = {
                "chain_id": chain_id,
                "local_verification": local_result,
                "distributed_verification": None,
                "overall_result": local_result["valid"]
            }
            
            # 분산 검증 (선택사항)
            if use_distributed_verification and local_result["valid"]:
                verification_data = {
                    "chain_id": chain_id,
                    "blocks": [block.to_dict() for block in self.blockchain.blocks[chain_id]],
                    "chain_info": self.blockchain.chains[chain_id].to_dict()
                }
                
                request_id = await self.verification_network.request_distributed_verification(
                    chain_id, verification_data
                )
                
                # 분산 검증 결과 대기 (타임아웃 설정)
                timeout = 60  # 60초
                start_time = time.time()
                
                while time.time() - start_time < timeout:
                    request_status = self.verification_network.verification_requests.get(request_id)
                    if request_status and request_status["status"] != "pending":
                        verification_result["distributed_verification"] = request_status["consensus_result"]
                        verification_result["overall_result"] = (
                            local_result["valid"] and 
                            request_status["consensus_result"]["valid"]
                        )
                        break
                    
                    await asyncio.sleep(1)
            
            # 감사 로그 기록
            self.audit_log.append({
                "action": "integrity_verification",
                "chain_id": chain_id,
                "result": verification_result["overall_result"],
                "timestamp": datetime.now().isoformat()
            })
            
            return verification_result
            
        except Exception as e:
            logging.error(f"대화 무결성 검증 오류: {e}")
            return {"success": False, "error": str(e)}
    
    async def issue_conversation_certificate(self, chain_id: str, owner_address: str,
                                           certificate_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """대화 증명서 발행"""
        try:
            # 체인 무결성 검증
            verification_result = await self.verify_conversation_integrity(chain_id)
            
            if not verification_result["overall_result"]:
                return {
                    "success": False,
                    "error": "체인 무결성 검증 실패"
                }
            
            # 메타데이터 준비
            chain = self.blockchain.chains[chain_id]
            metadata = {
                "name": f"Conversation Certificate #{chain_id[:8]}",
                "description": f"Verified conversation integrity certificate",
                "image": "https://example.com/certificate.png",
                "attributes": [
                    {"trait_type": "Chain ID", "value": chain_id},
                    {"trait_type": "Block Count", "value": chain.block_count},
                    {"trait_type": "Participants", "value": len(chain.participants)},
                    {"trait_type": "Creation Date", "value": chain.creation_time.isoformat()},
                    {"trait_type": "Verification Status", "value": chain.verification_status.value}
                ]
            }
            
            if certificate_metadata:
                metadata.update(certificate_metadata)
            
            # NFT 발행
            certificate = await self.nft_manager.mint_conversation_certificate(
                chain_id, owner_address, chain.current_hash, metadata
            )
            
            # 감사 로그 기록
            self.audit_log.append({
                "action": "certificate_issued",
                "chain_id": chain_id,
                "certificate_id": certificate.certificate_id,
                "owner_address": owner_address,
                "timestamp": datetime.now().isoformat()
            })
            
            return {
                "success": True,
                "certificate": certificate.to_dict()
            }
            
        except Exception as e:
            logging.error(f"대화 증명서 발행 오류: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_audit_trail(self, chain_id: str = None) -> List[Dict[str, Any]]:
        """감사 추적 조회"""
        if chain_id:
            return [
                log for log in self.audit_log 
                if log.get("chain_id") == chain_id
            ]
        else:
            return self.audit_log.copy()
    
    async def export_chain_data(self, chain_id: str) -> Dict[str, Any]:
        """체인 데이터 내보내기"""
        try:
            if chain_id not in self.blockchain.chains:
                return {"success": False, "error": "존재하지 않는 체인입니다"}
            
            chain = self.blockchain.chains[chain_id]
            blocks = self.blockchain.blocks[chain_id]
            
            export_data = {
                "chain_info": chain.to_dict(),
                "blocks": [block.to_dict() for block in blocks],
                "audit_trail": await self.get_audit_trail(chain_id),
                "export_timestamp": datetime.now().isoformat(),
                "integrity_verification": await self.verify_conversation_integrity(chain_id)
            }
            
            return {
                "success": True,
                "data": export_data
            }
            
        except Exception as e:
            logging.error(f"체인 데이터 내보내기 오류: {e}")
            return {"success": False, "error": str(e)}

# FastAPI 통합
from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel

class CreateConversationRequest(BaseModel):
    chat_room_id: str
    participants: List[str]

class AddMessageRequest(BaseModel):
    chain_id: str
    sender: str
    content: str
    message_type: str = "text"
    attachments: Optional[List[str]] = None

class VerifyIntegrityRequest(BaseModel):
    chain_id: str
    use_distributed_verification: bool = False

class IssueCertificateRequest(BaseModel):
    chain_id: str
    owner_address: str
    metadata: Optional[Dict[str, Any]] = None

# 글로벌 매니저 인스턴스
integrity_manager = None

async def get_integrity_manager():
    global integrity_manager
    if integrity_manager is None:
        integrity_manager = BlockchainIntegrityManager()
        await integrity_manager.initialize()
    return integrity_manager

# API 애플리케이션 생성
def create_blockchain_app() -> FastAPI:
    app = FastAPI(title="Blockchain Conversation Integrity System", version="1.0.0")
    
    @app.post("/conversations/create")
    async def create_conversation(request: CreateConversationRequest):
        """보안 대화 생성"""
        manager = await get_integrity_manager()
        result = await manager.create_secure_conversation(
            request.chat_room_id, request.participants
        )
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    
    @app.post("/messages/add")
    async def add_message(request: AddMessageRequest):
        """보안 메시지 추가"""
        manager = await get_integrity_manager()
        result = await manager.add_secure_message(
            request.chain_id,
            request.sender,
            request.content,
            request.message_type,
            request.attachments
        )
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    
    @app.post("/verify/integrity")
    async def verify_integrity(request: VerifyIntegrityRequest):
        """대화 무결성 검증"""
        manager = await get_integrity_manager()
        result = await manager.verify_conversation_integrity(
            request.chain_id, request.use_distributed_verification
        )
        return result
    
    @app.post("/certificates/issue")
    async def issue_certificate(request: IssueCertificateRequest):
        """대화 증명서 발행"""
        manager = await get_integrity_manager()
        result = await manager.issue_conversation_certificate(
            request.chain_id, request.owner_address, request.metadata
        )
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    
    @app.get("/audit/{chain_id}")
    async def get_audit_trail(chain_id: str):
        """감사 추적 조회"""
        manager = await get_integrity_manager()
        audit_trail = await manager.get_audit_trail(chain_id)
        return {"audit_trail": audit_trail}
    
    @app.get("/export/{chain_id}")
    async def export_chain(chain_id: str):
        """체인 데이터 내보내기"""
        manager = await get_integrity_manager()
        result = await manager.export_chain_data(chain_id)
        
        if result["success"]:
            return result["data"]
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    
    @app.get("/health")
    async def health_check():
        """헬스 체크"""
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    
    return app

if __name__ == "__main__":
    import os
    import uvicorn
    
    # 로깅 설정
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    app = create_blockchain_app()
    _p = int(os.environ.get("BLOCKCHAIN_CONVERSATION_INTEGRITY_PORT", os.environ.get("PORT", "8002")))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=_p,
        log_level="info"
    ) 