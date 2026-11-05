#!/bin/sh
# Installs tools/prepush_check.sh as this clone's git pre-push hook.
set -e
cd "$(git rev-parse --show-toplevel)"
cat > .git/hooks/pre-push <<'EOF'
#!/bin/sh
exec sh "$(git rev-parse --show-toplevel)/tools/prepush_check.sh"
EOF
chmod +x .git/hooks/pre-push
echo "pre-push hook installed"
