# argocd
Demo ArgoCd


## Quick Setup

- brew install kind\n
- kind version\n
- kind create cluster --name argocd-cluster\n
- kubectl cluster-info --context kind-argocd-cluster\n
- kubectl create namespace argocd\n
- kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml\n
- kubectl port-forward svc/argocd-server -n argocd 8080:443\n
- kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d\n


## Setup Key Items:

minikube 
https://minikube.sigs.k8s.io/docs/start/?arch=%2Fmacos%2Farm64%2Fstable%2Fbinary+download

- Status:  minikube status
- Start: minikube start

The output from `minikube status` shows that while the Minikube host (the VM or container running the cluster) is up, both the `kubelet` and `apiserver` are stopped. This explains why `kubectl` is getting a "connection refused" error when trying to connect to `127.0.0.1:49391`—the Kubernetes API server isn’t running.

Here’s how to fix it:

### Steps to Resolve

#### 1. Start the Minikube Cluster
Since the cluster components are stopped, you need to fully start Minikube:
```bash
minikube start
```
- If Minikube was already partially running (e.g., the host was up but the cluster wasn’t), this command will restart the `kubelet` and `apiserver`.
- If this fails, you might see an error message—let me know if that happens.

#### 2. Verify the Status
After starting, check the status again:
```bash
minikube status
```
You should see something like:
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```
If `apiserver` is running, the cluster is healthy.

#### 3. Test the Connection
Run:
```bash
kubectl cluster-info
```
This should now show details about the cluster (e.g., the Kubernetes control plane and CoreDNS locations). If it works, your `kubectl` is properly connected.

#### 4. Retry Your Original Command
Now try creating the namespace again:
```bash
kubectl create namespace argocd
```
If everything is fixed, this should succeed with an output like:
```
namespace/argocd created
```

### If `minikube start` Fails
If you get an error when starting Minikube, here are common fixes:
- **Driver issues**: Ensure your driver (e.g., Docker, VirtualBox) is installed and running. For Docker, check `docker ps` works. You can specify a driver with `minikube start --driver=docker`.
- **Stale state**: Delete and recreate the cluster:
  ```bash
  minikube delete
  minikube start
  ```
- **Resource issues**: Ensure your system has enough CPU/memory (Minikube defaults to 2 CPUs and 2GB RAM). Adjust with `minikube start --cpus=2 --memory=4096`.

### Why This Happened
The `kubelet` and `apiserver` being stopped could be due to:
- A previous `minikube stop` command.
- Minikube crashing or failing to fully initialize.
- A system reboot or resource contention stopping the cluster processes.

### Fix my issue

```minikube delete

🔥  Deleting "minikube" in docker ...
🔥  Deleting container "minikube" ...
🔥  Removing /Users/zachlewis/.minikube/machines/minikube ...
💀  Removed all traces of the "minikube" cluster.
zachlewis@Mac argocd % minikube start
😄  minikube v1.35.0 on Darwin 15.3.1 (arm64)
✨  Automatically selected the docker driver
📌  Using Docker Desktop driver with root privileges
👍  Starting "minikube" primary control-plane node in "minikube" cluster
🚜  Pulling base image v0.0.46 ...
🔥  Creating docker container (CPUs=2, Memory=7788MB) ...
🐳  Preparing Kubernetes v1.32.0 on Docker 27.4.1 ...
    ▪ Generating certificates and keys ...
    ▪ Booting up control plane ...
    ▪ Configuring RBAC rules ...
🔗  Configuring bridge CNI (Container Networking Interface) ...
🔎  Verifying Kubernetes components...
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
🌟  Enabled addons: storage-provisioner, default-storageclass
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default


zsh> argocd % minikube status                

minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured

zsh> argocd % kubectl create namespace argocd
```

### ArgoCD Start

```
zsh> kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

customresourcedefinition.apiextensions.k8s.io/applications.argoproj.io created
customresourcedefinition.apiextensions.k8s.io/applicationsets.argoproj.io created
customresourcedefinition.apiextensions.k8s.io/appprojects.argoproj.io created
serviceaccount/argocd-application-controller created
serviceaccount/argocd-applicationset-controller created
serviceaccount/argocd-dex-server created
serviceaccount/argocd-notifications-controller created
serviceaccount/argocd-redis created
serviceaccount/argocd-repo-server created
serviceaccount/argocd-server created
role.rbac.authorization.k8s.io/argocd-application-controller created
role.rbac.authorization.k8s.io/argocd-applicationset-controller created
role.rbac.authorization.k8s.io/argocd-dex-server created
role.rbac.authorization.k8s.io/argocd-notifications-controller created
role.rbac.authorization.k8s.io/argocd-redis created
role.rbac.authorization.k8s.io/argocd-server created
clusterrole.rbac.authorization.k8s.io/argocd-application-controller created
clusterrole.rbac.authorization.k8s.io/argocd-applicationset-controller created
clusterrole.rbac.authorization.k8s.io/argocd-server created
rolebinding.rbac.authorization.k8s.io/argocd-application-controller created
rolebinding.rbac.authorization.k8s.io/argocd-applicationset-controller created
rolebinding.rbac.authorization.k8s.io/argocd-dex-server created
rolebinding.rbac.authorization.k8s.io/argocd-notifications-controller created
rolebinding.rbac.authorization.k8s.io/argocd-redis created
rolebinding.rbac.authorization.k8s.io/argocd-server created
clusterrolebinding.rbac.authorization.k8s.io/argocd-application-controller created
clusterrolebinding.rbac.authorization.k8s.io/argocd-applicationset-controller created
clusterrolebinding.rbac.authorization.k8s.io/argocd-server created
configmap/argocd-cm created
configmap/argocd-cmd-params-cm created
configmap/argocd-gpg-keys-cm created
configmap/argocd-notifications-cm created
configmap/argocd-rbac-cm created
configmap/argocd-ssh-known-hosts-cm created
configmap/argocd-tls-certs-cm created
secret/argocd-notifications-secret created
secret/argocd-secret created
service/argocd-applicationset-controller created
service/argocd-dex-server created
service/argocd-metrics created
service/argocd-notifications-controller-metrics created
service/argocd-redis created
service/argocd-repo-server created
service/argocd-server created
service/argocd-server-metrics created
deployment.apps/argocd-applicationset-controller created
deployment.apps/argocd-dex-server created
deployment.apps/argocd-notifications-controller created
deployment.apps/argocd-redis created
deployment.apps/argocd-repo-server created
deployment.apps/argocd-server created
statefulset.apps/argocd-application-controller created
networkpolicy.networking.k8s.io/argocd-application-controller-network-policy created
networkpolicy.networking.k8s.io/argocd-applicationset-controller-network-policy created
networkpolicy.networking.k8s.io/argocd-dex-server-network-policy created
networkpolicy.networking.k8s.io/argocd-notifications-controller-network-policy created
networkpolicy.networking.k8s.io/argocd-redis-network-policy created
networkpolicy.networking.k8s.io/argocd-repo-server-network-policy created
networkpolicy.networking.k8s.io/argocd-server-network-policy created

zsh> kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

zsh> kubectl port-forward svc/argocd-server -n argocd 8080:443

zsh> 
```

### Set Password

```
zsh> argocd admin initial-password -n argocd


xxx

 This password must be only used for first time login. We strongly recommend you update the password using `argocd account update-password`.

```

### Demo App

```
 zsh> kubectl config get-contexts -o name
 
 zsh> argocd cluster add docker-desktop
 
 zsh> kubectl config set-context --current --namespace=argocd
 
 zsh> argocd app create guestbook --repo https://github.com/argoproj/argocd-example-apps.git --path guestbook --dest-server https://kubernetes.default.svc --dest-namespace default
 
 zsh> argocd app get guestbook
 
 zsh> argocd app sync guestbook

 ```