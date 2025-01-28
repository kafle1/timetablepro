#!/bin/bash

# Create directories if they don't exist
mkdir -p src/lib/assets/illustrations

# Download illustrations from unDraw (modern, customizable illustrations)
curl -o src/lib/assets/illustrations/auth-illustration-login.svg "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/auth-light.png"
curl -o src/lib/assets/illustrations/auth-illustration-register.svg "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/auth-dark.png"
curl -o src/lib/assets/illustrations/auth-illustration-forgot.svg "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/auth-light.png"

# Create a symbolic link in the static directory
mkdir -p static
ln -sf ../src/lib/assets/illustrations/auth-illustration-login.svg static/auth-illustration-login.svg
ln -sf ../src/lib/assets/illustrations/auth-illustration-register.svg static/auth-illustration-register.svg
ln -sf ../src/lib/assets/illustrations/auth-illustration-forgot.svg static/auth-illustration-forgot.svg

echo "Illustrations downloaded and linked successfully!" 