<img src="https://github.com/mathenaangeles/SamurAI/blob/main/client/src/app/assets/SAMURAI.png" width="100%" height="100%">

# SamurAI
SamurAI is an **AI governance platform** that protects organizations against operational, regulatory, and reputational risks at every stage of the lifecycle - from development to deployment. It does so through three key features.

1. **Project Inventory** - - SamurAI provides a catalog of all AI use cases as a centralized source of truth. This allows users to track and prioritize AI adoptions across their organization, maximizing investments and facilitating demand forecasting.
2. **Conformity Assessment** - SamurAI leverages its built-in RAG system to generate a risk profile for the registered projects. It is connected to an expansive legal corpus of AI-related guidelines, policies, and legislations. Users can chat with the model to develop a deeper understanding of the AI governance and ethics landscape as it applies to them.
3. **Risk Reporting** - SamurAI offers continuous monitoring via customizable project dashboards to ensure alignment with rapidly-evolving regulatory requirements and to build robust governance artifacts.

SamurAI bridges the gap between innovation and compliance, helping organizations thrive by safeguarding them against risks.

## Getting Started 
### Server
1. Navigate to the server directory. 
2. Create a virtual environment and activate it.
3. Add a `.env` file with the following contents:
```
AI71_API_KEY = <YOUR AI71 API KEY>
AI71_BASE_URL = <YOUR AI71 BASE URL>
TOKENIZERS_PARALLELISM = False
```
4. Run `pip install -r requirements.txt` to install all dependencies.
5. Start the server by running `python -m flask run`.

### Client
1. Navigate to the client directory.
2. Run `npm install` to install all dependencies.
3. Start the client by running `npm start`.

