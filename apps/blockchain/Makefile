# HauntedAI Smart Contracts Makefile
# Managed by Kiro

.PHONY: help install build test clean deploy-local deploy-sepolia deploy-mumbai deploy-amoy deploy-bsc

help:
	@echo "HauntedAI Smart Contracts - Available Commands:"
	@echo ""
	@echo "  make install        - Install dependencies"
	@echo "  make build          - Compile contracts"
	@echo "  make test           - Run all tests"
	@echo "  make test-gas       - Run tests with gas reporting"
	@echo "  make test-coverage  - Generate coverage report"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make format         - Format Solidity code"
	@echo "  make lint           - Check code formatting"
	@echo "  make snapshot       - Create gas snapshot"
	@echo ""
	@echo "  make deploy-local      - Deploy to local Anvil"
	@echo "  make deploy-sepolia    - Deploy to Sepolia testnet"
	@echo "  make deploy-mumbai     - Deploy to Mumbai testnet"
	@echo "  make deploy-amoy       - Deploy to Amoy testnet"
	@echo "  make deploy-polygon    - Deploy to Polygon mainnet"
	@echo "  make deploy-bsc        - Deploy to BSC mainnet"
	@echo "  make deploy-bsc-test   - Deploy to BSC testnet"
	@echo ""
	@echo "  make anvil          - Start local Anvil node"

install:
	forge install

build:
	forge build

test:
	forge test

test-gas:
	forge test --gas-report

test-coverage:
	forge coverage

test-verbose:
	forge test -vvv

clean:
	forge clean

format:
	forge fmt

lint:
	forge fmt --check

snapshot:
	forge snapshot

anvil:
	anvil

deploy-local:
	forge script script/Deploy.s.sol --rpc-url localhost --broadcast

deploy-sepolia:
	forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify

deploy-mumbai:
	forge script script/Deploy.s.sol --rpc-url mumbai --broadcast --verify

deploy-amoy:
	forge script script/Deploy.s.sol --rpc-url amoy --broadcast --verify

deploy-polygon:
	forge script script/Deploy.s.sol --rpc-url polygon --broadcast --verify

deploy-bsc:
	forge script script/Deploy.s.sol --rpc-url bsc --broadcast --verify

deploy-bsc-test:
	forge script script/Deploy.s.sol --rpc-url bsc_testnet --broadcast --verify
