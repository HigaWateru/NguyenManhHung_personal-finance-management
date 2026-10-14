# Hướng Dẫn Triển Khai Chuẩn DevOps Cho Dự Án Personal Finance Management

Tài liệu này cung cấp toàn bộ quy trình đưa dự án Fullstack (Spring Boot 21 + React 19 / Vite + MySQL 8 + Redis 7) lên máy chủ theo tiêu chuẩn DevOps công nghiệp.

---

## 1. Kết Quả Kiểm Tra Mã Nguồn (Build & Test)

Dự án đã được build và chạy test kiểm tra thực tế trên môi trường máy chủ cục bộ:
- **Client (Frontend)**:
  - `npm run lint`: **0 lỗi** (4 cảnh báo hook thông thường).
  - `npm run build`: **Thành công** trong 938ms, toàn bộ bundle tĩnh sẵn sàng tại `client/dist`.
- **Server (Backend)**:
  - `./gradlew test --rerun-tasks`: **Thành công 100%** (toàn bộ JUnit 5 test cases vượt qua).
  - `./gradlew bootJar`: **Thành công**, tạo file JAR runnable độc lập tại `server/build/libs/server-0.0.1-SNAPSHOT.jar`.

---

## 2. Kiến Trúc Hạ Tầng Triển Khai

```mermaid
flowchart TD
    subgraph GitHub["GitHub Ecosystem"]
        Repo["Git Repository (main)"]
        GHA["GitHub Actions (CI/CD)"]
        GHCR["GitHub Container Registry (ghcr.io)"]
    end

    subgraph VPS["Máy Chủ / Máy Ảo (Ubuntu Server 22.04 / 24.04 LTS)"]
        UFW["Firewall UFW (22, 80, 443)"]
        subgraph DockerNetwork["Docker Bridge Network: personal-finance-network"]
            Client["personal-finance-client (Nginx:80)"]
            Server["personal-finance-server (Spring Boot:8080)"]
            MySQL[("personal-finance-mysql (MySQL 8.0)")]
            Redis[("personal-finance-redis (Redis 7)")]
        end
    end

    User(["Người dùng trình duyệt"]) -->|HTTP/HTTPS :80/:443| Client
    Client -->|Reverse Proxy /api/, /oauth2/| Server
    Server -->|Port 3306| MySQL
    Server -->|Port 6379| Redis
    Repo -->|Push commit| GHA
    GHA -->|1. Test & Build Images| GHCR
    GHA -->|2. SSH Deploy| VPS
    GHCR -->|Docker Pull| DockerNetwork
```

---

## 3. Các Thành Phần Đã Tạo Sẵn Trong Dự Án

| Thành phần | Vị trí file | Mục đích |
| :--- | :--- | :--- |
| **Server Dockerfile** | `server/Dockerfile` | Multi-stage build (JDK 21 compile -> JRE 21 Alpine runtime), chạy user non-root `spring:spring`, tối ưu container RAM (`-XX:MaxRAMPercentage=75.0`). |
| **Server Prod Config** | `server/src/main/resources/application-prod.properties` | Cấu hình database pooling HikariCP, timezone UTC, bảo mật logging. |
| **Client Dockerfile** | `client/Dockerfile` | Multi-stage build (Node 20 compile -> Nginx 1.27 Alpine) tích hợp healthcheck. |
| **Nginx Web & Proxy** | `client/nginx.conf` | Phục vụ SPA React, bật Gzip nén dữ liệu, cache static files 1 năm, reverse-proxy `/api/` và `/oauth2/` sang backend. |
| **Docker Compose** | `docker-compose.yml` | Điều phối đồng thời MySQL 8, Redis 7, Server và Client với healthcheck tự động. |
| **Environment Template** | `.env.example` | Mẫu cấu hình bảo mật đầy đủ cho production. |
| **CI/CD Pipeline** | `.github/workflows/ci-cd.yml` | Tự động hóa: Test -> Build Docker -> Push GHCR -> SSH Deploy lên máy chủ. |
| **Root Gitignore** | `.gitignore` | Ngăn chặn rò rỉ file bí mật `.env` hoặc file log lên Git. |

---

## 4. Hướng Dẫn Chi Tiết Các Bước Triển Khai

### BƯỚC 1: Chuẩn Bị & Cấu Hình Máy Ảo (VPS)

> [!TIP]
> Bạn có thể thuê VPS tại các nhà cung cấp như **Hetzner, DigitalOcean, Linode, AWS EC2, Vultr** hoặc tạo máy ảo cục bộ bằng **VirtualBox / VMware / Multipass**.
> **Cấu hình tối thiểu khuyến nghị:** 2 vCPU, 2GB - 4GB RAM, 25GB SSD, hệ điều hành **Ubuntu 22.04 LTS** hoặc **24.04 LTS**.

#### 1.1. Đăng nhập và cập nhật hệ thống
```bash
ssh root@<IP_MÁY_CHỦ>
apt update && apt upgrade -y
```

#### 1.2. Tạo Swap Memory (Bắt buộc cho VPS RAM <= 4GB)
Spring Boot và MySQL khi khởi động đồng thời cần bộ nhớ đệm, Swap sẽ giúp tránh lỗi Out-Of-Memory (OOM):
```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

#### 1.3. Tạo User Quản Trị Không Phải Root (`deployer`)
```bash
adduser deployer
usermod -aG sudo deployer
```

#### 1.4. Cấu hình SSH Key cho User `deployer`
Trên máy tính cá nhân của bạn (PowerShell hoặc Terminal):
```bash
# Tạo SSH key nếu chưa có
ssh-keygen -t ed25519 -C "deployer@personal-finance"

# Đẩy public key lên VPS:
# Cách A: Dành cho Linux / macOS
ssh-copy-id -i ~/.ssh/id_ed25519.pub deployer@<IP_MÁY_CHỦ>

# Cách B: Dành cho Windows (PowerShell)
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh deployer@<IP_MÁY_CHỦ> "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

#### 1.5. Cấu hình Firewall UFW (Bảo Mật Máy Chủ)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH (Rất quan trọng: Phải mở trước khi enable để không bị mất kết nối)
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable          # Nhấn 'y' rồi Enter để xác nhận kích hoạt
sudo ufw status verbose  # Kiểm tra trạng thái tường lửa
```

#### 1.6. Cài đặt Docker & Docker Compose Plugin Chính Thức
Chạy các lệnh sau trên VPS (sử dụng `sudo` khi đang ở user `deployer`):

##### Cách A: Dùng script cài đặt chính thức tự động của Docker (Nhanh & ổn định nhất)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cấp quyền cho user deployer chạy docker không cần sudo
sudo usermod -aG docker deployer
sudo systemctl enable docker
sudo systemctl start docker
```

##### Cách B: Cài đặt thủ công từng bước qua kho lưu trữ APT
```bash
# Cài các gói phụ trợ
sudo apt install -y ca-certificates curl gnupg lsb-release

# Thêm khóa GPG của Docker
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Thêm repository Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Cập nhật và cài đặt Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Cấp quyền cho user deployer chạy docker không cần sudo
sudo usermod -aG docker deployer
sudo systemctl enable docker
sudo systemctl start docker
```

#### 1.7. Cài Đặt Các Framework & Môi Trường Runtime Liên Quan

Tùy theo chiến lược triển khai của bạn, có **2 phương pháp**:
* **Phương án 1 (Khuyến nghị cho Production - Dockerized)**: Các dịch vụ (Spring Boot, React Nginx, MySQL, Redis) đã được đóng gói độc lập trong Docker container. Trên VPS host chỉ cần cài thêm các công cụ CLI (`mysql-client`, `redis-tools`, `git`, `curl`, `jq`) để quản trị, kiểm tra dữ liệu và bảo trì.
* **Phương án 2 (Native / Bare-metal Runtime)**: Cài đặt trực tiếp toàn bộ runtime lên hệ điều hành VPS để chạy service systemd hoặc build/debug trực tiếp mà không dùng container.

Dưới đây là chi tiết cài đặt đầy đủ cho cả hai phương án:

##### A. Các công cụ Client & Quản trị hỗ trợ (Cho Phương án Dockerized)
Chạy trên VPS để hỗ trợ debug kết nối vào container hoặc backup/restore:
```bash
apt install -y git curl wget jq unzip mysql-client redis-tools
```
* **Kiểm tra kết nối MySQL Container từ host**: `mysql -h 127.0.0.1 -P 3306 -u root -p`
* **Kiểm tra kết nối Redis Container từ host**: `redis-cli -h 127.0.0.1 -p 6379 -a <REDIS_PASSWORD> ping`

---

##### B. Cài đặt chi tiết từng Framework trực tiếp trên Ubuntu (Cho Phương án Native)

###### 1. Java 21 LTS (OpenJDK 21 - Runtime cho Spring Boot)
Dự án sử dụng Java 21 LTS. Cài đặt OpenJDK 21 và cấu hình biến môi trường:
```bash
# Cài đặt OpenJDK 21
sudo apt install -y openjdk-21-jdk

# Kiểm tra phiên bản
java -version
javac -version

# (Tùy chọn) Cấu hình JAVA_HOME hệ thống
echo 'export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"' | sudo tee -a /etc/profile
echo 'export PATH="$JAVA_HOME/bin:$PATH"' | sudo tee -a /etc/profile
source /etc/profile
```

###### 2. Node.js 20 LTS & npm (Runtime cho React 19 + Vite Frontend)
Cài đặt Node.js LTS thông qua repository NodeSource chính thức:
```bash
# Thêm NodeSource PPA cho Node.js 20.x LTS (chú ý: sudo đặt ở trước bash)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Cài đặt Node.js & npm
sudo apt install -y nodejs

# Kiểm tra phiên bản
node -v   # v20.x.x
npm -v    # 10.x.x

# Cài đặt PM2 (Process Manager để quản lý chạy nền ứng dụng Node nếu cần)
sudo npm install -g pm2
```

###### 3. MySQL Server 8.0 (Cơ sở dữ liệu chính)
```bash
# Cài đặt MySQL Server
sudo apt install -y mysql-server

# Kích hoạt và bật tự khởi động cùng OS
sudo systemctl enable mysql
sudo systemctl start mysql

# Thiết lập mật khẩu root và khởi tạo Database / User dự án:
sudo mysql -u root -e "
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'replace_with_strong_root_password';
CREATE DATABASE IF NOT EXISTS personal_finance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'finance_user'@'localhost' IDENTIFIED BY 'replace_with_strong_user_password';
GRANT ALL PRIVILEGES ON personal_finance.* TO 'finance_user'@'localhost';
FLUSH PRIVILEGES;
"
```

###### 4. Redis Server 7 (Bộ nhớ đệm & Blacklist JWT Token)
```bash
# Cài đặt Redis Server
sudo apt install -y redis-server

# Cấu hình bảo mật mật khẩu cho Redis
# (Sửa requirepass trong /etc/redis/redis.conf)
sudo sed -i 's/^# requirepass foobared/requirepass replace_with_strong_redis_password/' /etc/redis/redis.conf

# Kích hoạt và restart Redis
sudo systemctl enable redis-server
sudo systemctl restart redis-server

# Kiểm tra Redis hoạt động
redis-cli -a replace_with_strong_redis_password ping
# Phản hồi: PONG
```

###### 5. Nginx Web Server (Reverse Proxy & Phục vụ Frontend)
```bash
# Cài đặt Nginx
sudo apt install -y nginx

# Kích hoạt Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Kiểm tra trạng thái
sudo systemctl status nginx
```

---

### BƯỚC 2: Chuẩn Bị Môi Trường Triển Khai Trên Máy Chủ

Đăng nhập bằng user `deployer`:
```bash
ssh deployer@<IP_MÁY_CHỦ>
```

Tạo thư mục ứng dụng và cấp quyền:
```bash
sudo mkdir -p /opt/personal-finance
sudo chown -R deployer:deployer /opt/personal-finance
cd /opt/personal-finance
```

Tạo file biến môi trường bí mật `.env` trên VPS:
```bash
nano .env
```
*(Dán nội dung từ template `.env.example`, thay thế các mật khẩu mạnh ngẫu nhiên):*
- `DB_ROOT_PASSWORD`: Mật khẩu root của MySQL
- `DB_PASSWORD`: Mật khẩu user của MySQL
- `REDIS_PASSWORD`: Mật khẩu Redis
- `JWT_SECRET`: Chuỗi bảo mật ngẫu nhiên (chạy lệnh `openssl rand -base64 48` trên VPS để tạo)
- `MAIL_USERNAME` & `MAIL_PASSWORD`: Tài khoản Gmail và App Password
- `GEMINI_API_KEY`: API key của Google Gemini
- `CLOUDINARY_*`, `GOOGLE_*`, `GITHUB_*`, `PLAID_*`: Các API key tương ứng.

Phân quyền bảo mật cho file `.env`:
```bash
chmod 600 /opt/personal-finance/.env
```

---

### BƯỚC 3: Thiết Lập GitHub Actions Secrets (CI/CD)

Vào repository GitHub của bạn: **Settings -> Secrets and variables -> Actions -> New repository secret**.

Thêm các Secret sau:

| Secret Name | Giá trị mẫu | Giải thích |
| :--- | :--- | :--- |
| `SSH_HOST` | `123.45.67.89` | Địa chỉ IP Public của VPS |
| `SSH_USER` | `deployer` | Tên user chạy ứng dụng trên VPS |
| `SSH_PORT` | `22` | Cổng SSH (mặc định là 22) |
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Nội dung private key của bạn (`~/.ssh/id_ed25519`) |
| `GHCR_PAT` | `ghp_xxxxxx...` | Personal Access Token của GitHub có quyền `read:packages` (tạo tại GitHub Settings -> Developer Settings -> Personal access tokens) |

> [!NOTE]
> Khi bạn push code lên nhánh `main`, GitHub Actions sẽ tự động:
> 1. Chạy lint và build test Frontend.
> 2. Chạy test Backend với Gradle.
> 3. Tự động đóng gói Docker Images và đẩy lên `ghcr.io`.
> 4. SSH vào VPS, pull images mới nhất và chạy `docker compose up -d`.

---

### BƯỚC 4: Cấu Hình Domain & Chứng Chỉ SSL HTTPS (Let's Encrypt)

Để dự án chạy chuẩn `https://yourdomain.com`:

#### 4.1. Trỏ DNS
Vào trang quản lý tên miền (Cloudflare, Namecheap, v.v.):
- Tạo bản ghi **A**: `@` -> `<IP_MÁY_CHỦ>`
- Tạo bản ghi **A**: `www` -> `<IP_MÁY_CHỦ>`

#### 4.2. Cài đặt Nginx Reverse Proxy & Certbot trên VPS Host
Cách tiếp cận tối ưu nhất cho VPS là dùng Nginx ngoài máy chủ làm SSL Termination:
```bash
sudo apt install -y certbot python3-certbot-nginx nginx
```

Tạo file cấu hình virtual host:
```bash
sudo nano /etc/nginx/sites-available/personal-finance.conf
```
Nội dung:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt cấu hình và lấy chứng chỉ SSL tự động:
```bash
sudo ln -s /etc/nginx/sites-available/personal-finance.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Chạy Certbot để kích hoạt HTTPS tự động gia hạn
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### BƯỚC 5: Tự Động Backup Database (Chuẩn Vận Hành)

Tạo script tự động sao lưu MySQL hàng ngày vào lúc 2:00 sáng:
```bash
sudo mkdir -p /opt/backups/mysql
sudo nano /opt/backups/backup_mysql.sh
```

Nội dung:
```bash
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/backups/mysql"
source /opt/personal-finance/.env

docker exec personal-finance-mysql mysqldump -u root -p"${DB_ROOT_PASSWORD}" "${DB_NAME}" | gzip > "${BACKUP_DIR}/backup_${DB_NAME}_${DATE}.sql.gz"

# Giữ lại bản sao lưu trong 14 ngày gần nhất
find ${BACKUP_DIR} -type f -name "*.sql.gz" -mtime +14 -delete
```

Cấp quyền thực thi và tạo cronjob:
```bash
sudo chmod +x /opt/backups/backup_mysql.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backups/backup_mysql.sh > /dev/null 2>&1") | crontab -
```

---

## 5. Cẩm Nang Lệnh Kiểm Tra & Vận Hành Dễ Nhớ (Cheatsheet)

### 5.1. Bộ 3 Lệnh "Thần Chú" Thường Dùng Nhất (Dành cho 90% trường hợp)
```bash
# 1. Kiểm tra container nào đang sống / chết
docker ps -a

# 2. Xem trực tiếp log hệ thống để bắt lỗi
cd /opt/personal-finance && docker compose logs -f

# 3. Xem RAM và Swap của máy chủ có bị cạn kiệt không
free -h
```

---

### 5.2. Kiểm Tra Tài Nguyên & Sức Khỏe VPS (Hardware Health)

| Mục đích | Câu lệnh | Cách đọc kết quả |
| :--- | :--- | :--- |
| **Xem RAM & Swap** | `free -h` | `-h` là *Human-readable*. Nhìn dòng `Mem` (cột `available`) và dòng `Swap`. |
| **Xem dung lượng ổ cứng** | `df -h` | *Disk Free*. Kiểm tra phân vùng `/` xem `Use%` có chạm ngưỡng 90-100% không. |
| **Bảng điều khiển CPU / RAM** | `htop` | Giao diện đồ họa xem tiến trình nào ngốn CPU/RAM *(bấm `q` để thoát)*. |
| **Thời gian máy chạy (Uptime)** | `uptime` | Xem máy chạy được bao lâu và mức tải trung bình (`load average`). |

---

### 5.3. Kiểm Tra Mạng, Cổng (Port) & Tường Lửa (Network & Security)

| Mục đích | Câu lệnh | Kết quả mong đợi |
| :--- | :--- | :--- |
| **Kiểm tra Tường lửa** | `sudo ufw status` | Các cổng `22` (SSH), `80` (HTTP), `443` (HTTPS) ở trạng thái `ALLOW`. |
| **Xem các cổng đang lắng nghe** | `sudo ss -tuln` | Thấy cổng `:80`, `:443`, `:3306`, `:6379` ở trạng thái `LISTEN`. |
| **Test web server tại chỗ** | `curl -I http://localhost` | Trả về `HTTP/1.1 200 OK` (Nginx/React đang phản hồi tốt). |
| **Test API Backend từ VPS** | `curl -I http://localhost:8080/api/auth/health` | Kiểm tra Spring Boot backend có phản hồi không. |

---

### 5.4. Quản Trị & Kiểm Tra Docker Nhanh

```bash
# 1. Xem danh sách container đang chạy
docker ps

# 2. Xem TẤT CẢ container (kể cả container bị dừng hoặc crash "Exited")
docker ps -a

# 3. Bảng đo lường RAM & CPU từng container đang tiêu thụ thời gian thực
docker stats
# (Bấm Ctrl + C để thoát)

# 4. Xem log theo dõi thời gian thực của toàn bộ hệ thống
cd /opt/personal-finance
docker compose logs -f

# 5. Xem log riêng của Backend Spring Boot
docker compose logs -f server

# 6. Xem nhanh 50 dòng log cuối cùng của một container bất kỳ (rất hữu ích khi crash)
docker logs --tail 50 personal-finance-server
docker logs --tail 50 personal-finance-mysql
```

---

### 5.5. Kiểm Tra Trực Tiếp Database (MySQL) & Cache (Redis)

Không cần cài thêm client trên máy chủ, bạn có thể gọi thẳng vào trong container:

```bash
# 1. Kiểm tra Redis phản hồi (Ping - Pong)
docker exec -it personal-finance-redis redis-cli ping
# Nếu Redis có mật khẩu:
docker exec -it personal-finance-redis redis-cli -a <REDIS_PASSWORD> ping
# -> Trả về: PONG là hoạt động tốt.

# 2. Kiểm tra MySQL và danh sách database:
docker exec -it personal-finance-mysql mysql -u root -p -e "SHOW DATABASES;"
# -> Nhập mật khẩu root MySQL, thấy database "personal_finance" là chuẩn.

# 3. Kiểm tra số lượng bảng đã được Hibernate tự động tạo:
docker exec -it personal-finance-mysql mysql -u root -p -e "USE personal_finance; SHOW TABLES;"
```

---

### 5.6. Các Lệnh Xử Lý Khẩn Cấp (Emergency Commands)

```bash
# 1. Khởi động lại toàn bộ hệ sinh thái:
cd /opt/personal-finance
docker compose restart

# 2. Chỉ khởi động lại riêng Backend (không làm gián đoạn MySQL / Redis):
docker compose restart server

# 3. Cập nhật và kéo image mới nhất về chạy lại:
docker compose pull && docker compose up -d

# 4. Dừng hẳn và xóa bỏ stack (Reset sạch sẽ container & network):
docker compose down

# 5. Khởi động lại ở chế độ chạy ngầm:
docker compose up -d

# 6. Dọn dẹp rác Docker giải phóng dung lượng ổ cứng (xóa cache build, image cũ mồ côi):
docker system prune -f

# 7. Khôi phục dữ liệu MySQL từ bản backup nén .sql.gz:
gunzip < /opt/backups/mysql/backup_personal_finance_YYYYMMDD.sql.gz | docker exec -i personal-finance-mysql mysql -u root -p<ROOT_PASSWORD> personal_finance
```
