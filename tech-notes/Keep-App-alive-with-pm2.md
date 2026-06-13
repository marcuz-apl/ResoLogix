## Keep Web App alive with pm2

To keep the web app running even after you close the Antigravity IDE, you need to detach the server process from this session. Here are the best ways to do it, depending on your preference:

#### Option 1: Use Docker (Recommended for continuous uptime)
Since we already have a docker-compose.yml file configured, you can run the app inside a Docker container in "detached" mode. It will stay alive in the background until you explicitly stop it or restart your machine. Open a normal terminal outside of Antigravity, navigate to your project folder (/root/projects/ResoLogix), and run:

```shell
docker-compose up -d
(To stop it later, run docker-compose down)
```
#### Option 2: Use nohup (Simplest method)
You can run the Next.js development server in the background and ignore the "hangup" signal when Antigravity closes. Open a normal terminal in /root/projects/ResoLogix and run:

```shell
nohup npm run dev > server.log 2>&1 &
```
This pushes the process to the background and saves all logs to `server.log`.

#### Option 3: Use pm2 (Best for auto-restarting)

If you want the app to automatically restart if it crashes, pm2 is the industry standard for Node.js apps. In a normal terminal, run:

```shell
# Install pm2 globally if you haven't already
npm install -g pm2
# Start the dev server with pm2
pm2 start npm --name "resologix" -- run dev
```
**Note on the Current Server:**
Right now, npm run dev is running as an internal background task within my environment. If you shut me down, that specific server instance will stop. To transition, you can just start the app using one of the methods above after I shut down (or on a separate port if you want to test it now).