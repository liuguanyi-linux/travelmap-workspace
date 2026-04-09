# Changelog

## 2026-04-09 安全加固 & 代码修复

### 安全修复
1. **JWT 鉴权体系**：admin-login 返回真 JWT token（7天有效期），创建 AdminGuard 保护所有管理接口
2. **API 权限控制**：所有 Post/Put/Patch/Delete 管理操作需 admin token，公开接口不受影响
3. **HTTPS 强制跳转**：HTTP 80 → 301 → HTTPS 443
4. **CORS 限制**：origin 从 `*` 改为仅允许 anjen.net 和 localhost:5173
5. **密码/JWT Secret**：从硬编码移到 .env 文件
6. **关闭 uploads autoindex**：防止文件列表被公开浏览

### 功能修复
7. **前端登录简化**：去掉假验证码步骤，直接邮箱登录
8. **AdminLogin**：存真 JWT token 而非 demo_token
9. **AuthContext**：isAdmin 改为检查 admin_token 存在性，删除不安全的 fallback 随机 ID 逻辑
10. **UserList**：login-logs 请求改用带 token 的 api 实例，修复 401 导致的 forEach 崩溃
11. **Spot ID**：创建 Spot 不再用 Date.now()，改用 Prisma autoincrement
12. **Review userId**：非法 userId 不再默认挂到 admin(1)，改为 null
13. **Booking**：增加 userId/poiId/date 必填参数校验

### 运维改进
14. **PM2 进程守护**：后端用 PM2 管理，配置开机自启
15. **GitHub 自动同步**：配置 SSH key，创建 sync.sh 脚本

### 代码清理
16. 删除 users.service.ts 未使用的 https import 和 geoIp 死代码变量
17. 删除 guides/strategies service 中的调试 console.log
18. 删除 guides/strategies service 中仅用于调试的反向查询
