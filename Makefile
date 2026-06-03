# Makefile for Currency Agent (A2A + ADK + MCP)

# Use uv for running python commands
PYTHON_CMD ?= uv run python

# Environment variables for local development
export GOOGLE_GENAI_USE_VERTEXAI ?= False
export LOG_LEVEL ?= INFO
export GENAI_MODEL ?= gemini-2.5-flash
export MCP_SERVER_URL ?= http://127.0.0.1:8080/mcp

.PHONY: help install mcp agent frontend test-client e2e-test adktest test frontend-test lint format clean start stop status deploy logs endpoint remote-status frontend-install frontend-build react-install react-ui react-agent

help:
	@echo "Available commands:"
	@echo "  install       - Install all project dependencies (including frontend and react UI)"
	@echo "  start         - Start all services in background (MCP + Agent)"
	@echo "  stop          - Stop all background services"
	@echo "  status        - Check status of background services"
	@echo "  mcp           - Start the MCP Server (foreground)"
	@echo "  agent         - Start the A2A Agent Server (foreground)"
	@echo "  frontend      - Build and start the FastAPI + Vanilla TS frontend server (port 8000)"
	@echo "  react-install - Install dependencies for React + CopilotKit UI"
	@echo "  react-ui      - Start React Frontend UI (port 3000)"
	@echo "  react-agent   - Start React Frontend Agent (port 8000)"
	@echo "  test-client   - Run the A2A Client (test queries)"
	@echo "  e2e-test      - Run end-to-end tests (alias for test-client)"
	@echo "  adktest       - Run interactive ADK CLI for the agent"
	@echo "  test          - Run all tests (pytest)"
	@echo "  frontend-test - Run frontend specific tests"
	@echo "  lint          - Run linting checks (ruff)"
	@echo "  format        - Auto-format code (ruff)"
	@echo "  clean         - Remove caches and logs"
	@echo "  deploy        - Deploy to Cloud Run using Cloud Build"
	@echo "  logs          - Read logs from Cloud Run"
	@echo "  endpoint      - Get the Cloud Run service endpoint"
	@echo "  remote-status - Check the status of the remote endpoint"

install:
	@echo "Installing dependencies..."
	uv sync
	$(MAKE) frontend-install
	$(MAKE) react-install

start:
	@echo "Starting MCP Server in background..."
	@nohup uv run mcp-server/server.py > mcp.log 2>&1 &
	@echo "Waiting for MCP Server to initialize..."
	@sleep 2
	@echo "Starting A2A Agent Server in background..."
	@nohup uv run uvicorn currency_agent.agent:a2a_app --host 127.0.0.1 --port 10000 > agent.log 2>&1 &
	@echo "Services started. Logs: mcp.log, agent.log"

stop:
	@echo "Stopping servers..."
	@pgrep -f "mcp-server/server.py" | grep -v "$$$$" | xargs kill -9 2>/dev/null || true
	@pgrep -f "uvicorn currency_agent.agent:a2a_app" | grep -v "$$$$" | xargs kill -9 2>/dev/null || true
	@pgrep -f "frontend/main.py" | grep -v "$$$$" | xargs kill -9 2>/dev/null || true
	@sleep 1

status:
	@echo "Checking status of background services..."
	@PID_MCP=$$(pgrep -f "[m]cp-server/server.py" | tr '\n' ' '); \
	if [ -n "$$PID_MCP" ]; then \
		PIDS=$$(echo "$$PID_MCP" | tr ' ' ','); \
		PORTS=$$(lsof -i -P -n -a -p "$$PIDS" 2>/dev/null | grep LISTEN | awk '{print $$9}' | awk -F: '{print $$NF}' | sort -u | tr '\n' ' ' | sed 's/ *$$//'); \
		if [ -n "$$PORTS" ]; then \
			echo "  MCP Server:       Running (PID $$PID_MCP) on port(s): $$PORTS"; \
		else \
			echo "  MCP Server:       Running (PID $$PID_MCP)"; \
		fi; \
	else \
		echo "  MCP Server:       Stopped"; \
	fi
	@PID_AGENT=$$(pgrep -f "[u]vicorn currency_agent.agent:a2a_app" | tr '\n' ' '); \
	if [ -n "$$PID_AGENT" ]; then \
		PIDS=$$(echo "$$PID_AGENT" | tr ' ' ','); \
		PORTS=$$(lsof -i -P -n -a -p "$$PIDS" 2>/dev/null | grep LISTEN | awk '{print $$9}' | awk -F: '{print $$NF}' | sort -u | tr '\n' ' ' | sed 's/ *$$//'); \
		if [ -n "$$PORTS" ]; then \
			echo "  A2A Agent Server: Running (PID $$PID_AGENT) on port(s): $$PORTS"; \
		else \
			echo "  A2A Agent Server: Running (PID $$PID_AGENT)"; \
		fi; \
	else \
		echo "  A2A Agent Server: Stopped"; \
	fi
	@PID_FRONTEND=$$(pgrep -f "[f]rontend/main.py" | tr '\n' ' '); \
	if [ -n "$$PID_FRONTEND" ]; then \
		PIDS=$$(echo "$$PID_FRONTEND" | tr ' ' ','); \
		PORTS=$$(lsof -i -P -n -a -p "$$PIDS" 2>/dev/null | grep LISTEN | awk '{print $$9}' | awk -F: '{print $$NF}' | sort -u | tr '\n' ' ' | sed 's/ *$$//'); \
		if [ -n "$$PORTS" ]; then \
			echo "  Frontend Server:  Running (PID $$PID_FRONTEND) on port(s): $$PORTS"; \
		else \
			echo "  Frontend Server:  Running (PID $$PID_FRONTEND)"; \
		fi; \
	else \
		echo "  Frontend Server:  Stopped"; \
	fi




test:
	@echo "Running tests..."
	-$(MAKE) stop
	$(MAKE) start
	-uv run pytest
	$(MAKE) stop

mcp:
	@echo "Starting MCP Server on port 8080..."
	uv run mcp-server/server.py

agent:
	@echo "Starting A2A Agent Server on port 10000..."
	uv run uvicorn currency_agent.agent:a2a_app --host 127.0.0.1 --port 10000

frontend: frontend-build
	@echo "Starting Frontend Server on port 8000..."
	@PORT=8000 AGENT_SERVER_URL=http://127.0.0.1:10000 uv run frontend/main.py

frontend-install:
	@echo "Installing frontend dependencies..."
	cd frontend/frontend && npm install
	uv pip install -r frontend/requirements.txt

frontend-build:
	@echo "Building frontend..."
	cd frontend/frontend && npm run build

frontend-test:
	@echo "Running frontend tests..."
	@PYTHONPATH=frontend uv run pytest frontend/tests

test-client:
	@echo "Running A2A Client tests..."
	uv run currency_agent/test_client.py

e2e-test: test-client

adktest:
	@echo "Starting interactive ADK CLI..."
	@echo "Note: Ensure MCP Server is running (make mcp) if tools are needed."
	uv run adk run currency_agent

lint:
	@echo "Running linting checks (ruff check + format)..."
	uv run ruff check .
	uv run ruff format --check .

format:
	@echo "Auto-formatting code..."
	uv run ruff format .
	uv run ruff check --fix .

clean:
	@echo "Cleaning up caches and temporary files..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
	find . -type d -name ".venv" -exec rm -rf {} +
	find . -type f -name "*.log" -delete
	@echo "Clean completed."

deploy:
	@echo "Deploying to Cloud Run via Cloud Build..."
	gcloud builds submit --config cloudbuild.yaml .

logs:
	@echo "Reading Cloud Run service logs..."
	gcloud run services logs read currency-agent --region us-central1 --limit 5

endpoint:
	@echo "Getting Cloud Run service endpoint..."
	@gcloud run services describe currency-agent --region us-central1 --format "value(status.url)"

remote-status:
	@echo "Checking remote endpoint status..."
	@ENDPOINT=$$(gcloud run services describe currency-agent --region us-central1 --format "value(status.url)"); \
	curl -s -o /dev/null -w "%{http_code}" $$ENDPOINT/health || echo "Failed to connect"

react-install:
	@echo "Installing React frontend dependencies..."
	cd frontend-react && npm install

react-ui:
	@echo "Starting React Frontend UI (port 3000)..."
	cd frontend-react && npm run dev:ui

react-agent:
	@echo "Starting React Frontend Agent (port 8000)..."
	cd frontend-react && npm run dev:agent

