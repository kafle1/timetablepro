.PHONY: install dev build init-db cleanup-db

# Essential Commands
install:
	yarn install

dev:
	yarn dev

build:
	yarn build

# Database Management
init-db:
	yarn init-db

cleanup-db:
	yarn cleanup-db

# Combined Commands
setup: install init-db

reset-db: cleanup-db init-db

# Help
help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build for production"
	@echo "  make init-db     - Initialize Appwrite database"
	@echo "  make cleanup-db  - Clean up Appwrite resources"
	@echo "  make setup       - Install deps and init database"
	@echo "  make reset-db    - Reset database (cleanup + init)" 
