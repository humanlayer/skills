---
name: run-ec2-daemon
description: Create, secure, authenticate, and verify an exploratory HumanLayer daemon host on AWS EC2
---

# Run a HumanLayer daemon on EC2

Create an EC2 host for a HumanLayer daemon, install a systemd user service, and verify failure and reboot recovery.

## Required warning

Before creating resources, tell the user:

> [!WARNING]
> This EC2 setup is exploratory. It is on you to secure, update, monitor, and generally manage the host. The daemon and its coding agents can use the host user's files, credentials, and network access. Review the setup before you rely on it.

Do not soften or omit this warning.

## Ask before provisioning

Ask this question before any resource creation:

> Do you have a VPN, Tailscale, SSM bastion, or other private route to the host, or does it need a public IP?

Also ask for the AWS profile and region if the user did not provide them. Ask no more questions than needed. Inspect existing VPCs, subnets, bastions, key pairs, and SSM-managed instances before asking for values AWS can provide.

Use these defaults only after the user chooses the access model:

- Private access: no public IP; connect through the route the user selected.
- Public access: public IP; restrict SSH to the user's current trusted address.
- Open no other inbound ports unless the user asks for them.

## Safety rules

- Never create an AMI, image, snapshot, or machine backup from a host after any user or service login.
- Treat HumanLayer, coding-agent, source-control, SSH, cloud, and package-registry credentials as secrets.
- Build reusable images from a clean, unauthenticated host. Authenticate only after launching the final instance.
- Never copy a configured root disk to move a host. Launch a clean host and copy only named, reviewed, non-secret files.
- Do not print tokens, credential files, or secret values.
- Do not change or delete unrelated AWS resources.
- Tag created resources and tell the user what will keep costing money.

## Provision the host

1. Confirm the AWS identity and selected region.
2. Inspect the selected VPC, subnet route table, and access path.
3. Create a dedicated security group with the minimum inbound rule for the selected access model.
4. Launch a current supported Linux image with:
   - no public IP for private access, or a public IP only when selected;
   - IMDSv2 required;
   - an encrypted, delete-on-termination root volume;
   - clear `Name`, purpose, owner, and expiry tags when supported by the user's tag policy.
5. Wait for EC2 status checks and connect through the selected path.
6. Install a supported Node.js version and `@humanlayer/cli@latest`.
7. Install only the coding agent and source-control tools the user asks for. Their authentication is separate from HumanLayer authentication.

For private AWS access through an SSM bastion, prefer `AWS-StartPortForwardingSessionToRemoteHost` to forward a local port to port 22 on the private host. Keep the SSM process open while using SSH through `127.0.0.1`.

## Authenticate HumanLayer

Run `humanlayer login` as the same unprivileged user that will run the daemon. For remote device login, keep the command alive in `tmux` while the user opens the URL and enters the code.

Do not use `--launch-token` for the systemd service. Launch-token credentials last only for one daemon process and cannot authenticate a later service restart.

## Install the user service

Resolve the absolute CLI path with `command -v humanlayer`. Create `~/.config/systemd/user/humanlayer-daemon.service` for the daemon user:

```ini
[Unit]
Description=HumanLayer daemon
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
ExecStart=/absolute/path/to/humanlayer daemon launch
Restart=on-failure
RestartSec=5
TimeoutStopSec=60

[Install]
WantedBy=default.target
```

If required tools are not on systemd's default path, add an explicit `Environment="PATH=..."` with reviewed absolute directories. Do not import a shell profile into the service.

Enable user lingering and the service:

```bash
sudo loginctl enable-linger "$USER"
systemctl --user daemon-reload
systemctl --user enable --now humanlayer-daemon.service
```

## Verify

Confirm all of the following:

1. `systemctl --user is-enabled humanlayer-daemon.service` returns `enabled`.
2. `systemctl --user is-active humanlayer-daemon.service` returns `active`.
3. The journal shows token exchange, runtime initialization, and heartbeat startup without printing a token.
4. A normal service restart returns to `active`.
5. With the user's approval, a forced process failure triggers `Restart=on-failure` and produces a new main PID.
6. With the user's approval, a full EC2 reboot starts the service without an SSH login.
7. The instance has the selected public-IP state and only the intended inbound rules.
8. Outbound access works if the daemon needs it.

Useful log commands:

```bash
journalctl --user -u humanlayer-daemon.service -n 200 --no-pager -o short-iso
journalctl --user -u humanlayer-daemon.service -b
journalctl --user -u humanlayer-daemon.service -b -1
```

Explain that journal persistence and retention depend on the host's journald settings. Do not change system-wide retention without the user's approval.

## Finish

Report:

- account, region, instance ID, instance type, subnet, private IP, and public IP state;
- security-group inbound sources and ports;
- how to connect;
- service enabled and active state;
- recovery tests performed and their results;
- where to read logs;
- all created resources and likely ongoing costs;
- cleanup commands or steps.

Repeat that this is an exploratory setup and the user owns host security, updates, monitoring, costs, credential rotation, and cleanup.
