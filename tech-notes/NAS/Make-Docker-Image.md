# ResoLogix Docker Deployment Guide

This document explains how to build the multi-platform Docker image for ResoLogix, push it to Docker Hub, and run the app on a Synology NAS using Docker Compose.

---

## 1. Prerequisites
Ensure you have the following installed on your build machine:
* Docker & Docker Buildx
* Access to a terminal with your Docker Hub account logged in (`docker login`).

To enable multi-platform building (e.g., building `arm64` images on an `amd64` machine), run the following command to register QEMU emulator handlers:
```bash
docker run --privileged --rm tonistiigi/binfmt --install all
```

---

## 2. Build & Push Multi-Platform Image
To build the image for both `amd64` (typical PCs/servers) and `arm64` (ARM-based servers and Synology NAS models) and push it directly to Docker Hub:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t marcuszou/resologix:latest --push .
```

---

## 3. Deploying on Synology NAS
Follow these instructions to run the container using the Docker Compose file:

### Step 3.1: Prepare Directories
1. Open **File Station** in Synology DSM.
2. Go to the default shared folder **`docker`**.
3. Create a folder named **`resologix`**.
4. Inside `/docker/resologix`, create two subfolders:
   * **`data`** (for persistent SQLite database)
   * **`reports`** (for persistent PDF/Excel/Word report files)

### Step 3.2: Copy and Configure Environment Variables
1. Copy the [NAS-docker-compose.yml](file:///root/projects/ResoLogix/tech-notes/NAS/NAS-docker-compose.yml) file into `/volume1/docker/resologix/docker-compose.yml`.
2. Create a new file named **`.env`** and place it in the **same directory** as the `docker-compose.yml` file. 

The directory structure on your Synology NAS must look like this:
```text
/volume1/docker/resologix/
├── docker-compose.yml
├── .env
├── data/
└── reports/
```

3. Open the `.env` file and configure it using the template from [NAS.env.example](file:///root/projects/ResoLogix/tech-notes/NAS/NAS.env.example). Make sure to input your correct Google App Password in the `EMAIL_PASS` field (without double quotes) so the app can send out emails:
   ```env
   # .env file configuration example
   NEXTAUTH_SECRET=vUCA9smlNX5qbTKaLlwebPBaycyrayKA79Zr8koiL3M=
   NEXTAUTH_URL=http://<YOUR_SYNOLOGY_IP>:3010
   EMAIL_USER=marcus.zou@gmail.com
   EMAIL_PASS=hynh igvu umog fzlf
   EMAIL_FROM=ResoLogix <marcus.zou@gmail.com>
   ```

### Step 3.3: Launch the Container

#### Method A: Via Container Manager UI (DSM 7.2+)
1. Open **Container Manager**.
2. Click **Project** on the left menu, then click **Create**.
3. Set the project path to `/docker/resologix`.
4. Choose **Create docker-compose.yml** and paste the content of the compose file, or upload the file directly.
5. Finish the wizard to pull the image and launch the container.

#### Method B: Via SSH Command Line
1. SSH into your Synology NAS:
   ```bash
   ssh your_nas_username@your_nas_ip
   ```
2. Navigate to the project folder:
   ```bash
   cd /volume1/docker/resologix
   ```
3. Start the container in detached mode:
   ```bash
   sudo docker-compose up -d
   ```

The application will now be running on your Synology NAS at `http://<YOUR_NAS_IP>:3010`.

---

## 4. Troubleshooting: EACCES Permission Denied Errors
If you run into an error like `[Error] EACCES: permission denied, mkdir '/app/reports/...'` when trying to save scenarios or write reports:

### Why it happens
Inside the Docker container, the application runs under a non-root user named `nextjs` with **UID `1001`**. When Synology folders are mounted into the container (`./reports` and `./data`), they are owned by your DSM admin user by default, preventing the container from writing to them.

### Solution A: Via Synology DSM GUI (File Station)
1. Open **File Station** on DSM.
2. Right-click the **`reports`** folder and select **Properties**.
3. Under the **Permission** tab, create/edit permissions to grant **Everyone** full **Write** access.
4. Check **"Apply to this folder, sub-folders and files"** and click **Save**.
5. Repeat the steps for the **`data`** folder.

### Solution B: Via SSH Command Line
1. SSH into your NAS and navigate to `/volume1/docker/resologix`.
2. Change the folder ownership to UID/GID `1001`:
   ```bash
   sudo chown -R 1001:1001 reports
   sudo chown -R 1001:1001 data
   ```

---

## 5. Troubleshooting: Password Reset / SMTP Failures
If the password reset function does not work (you don't receive emails or get locked out):

### Case A: Quotes in `.env` passwords (Most Common)
* **Problem**: In local `.env.local` files, Next.js strips double quotes. However, Docker Compose passes double quotes literally. If you configured `EMAIL_PASS="hynh igvu umog fzlf"`, nodemailer will try to log in with the quotes included and fail.
* **Solution**: Remove double quotes in the Synology `.env` file:
  ```env
  EMAIL_PASS=hynh igvu umog fzlf
  ```

### Case B: Synology Firewall/Network Outbound Blocks
* **Problem**: Synology NAS may block outbound connections to ports `465` (SSL) or `587` (TLS) used by Gmail SMTP.
* **Solution**: Ensure your Synology NAS firewall rules allow outbound traffic on these ports.

### Case C: Restart Container to Apply Changes
* **Problem**: Updating the `.env` file does not automatically refresh env vars in running containers.
* **Solution**: Recreate the container:
  ```bash
  docker-compose down
  docker-compose up -d
  ```

