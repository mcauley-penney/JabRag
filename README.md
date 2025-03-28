# 🤖 JabRag

A [Probot](https://github.com/probot/probot) GitHub App that uses Retrieval Augmented Generation to answer questions about JabRef in GitHub discussions.

## Setup

### Dependencies

You must install dependencies for both the bot and the Python backend. Do

```sh
# Install JS dependencies
npm install

# install Python dependencies
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

You will also need:
- a properly defined `.env` file
- a private key `.pem` file

### Run

To run the bot, do

```sh
npm start
```
