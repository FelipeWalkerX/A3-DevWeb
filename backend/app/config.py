import os

from dotenv import load_dotenv

load_dotenv()   #Le as variaveis do arquivo .env (em producao elas vem do painel do Render)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b") #Pega o modelo de variavel que eu quero, se ela nao existir, usa um valor padrao (que nesse caso é o openai/gpt-oss-120b)

#O split permite varios sites separados por virgula, o strip tira espaços e a barra do final
CORS_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv("CLAREIA_CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

#JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "chave-local-de-desenvolvimento-troque-em-producao")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = int(os.getenv("ACCESS_TOKEN_MINUTES", "15"))    #Token curto, usado em todas as requisições
REFRESH_TOKEN_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "7"))         #Token longo, usado só para pedir um novo access token

#Professor criado automaticamente quando a API sobe (se ainda nao existir)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "professor")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "clareia123")
ADMIN_NAME = os.getenv("ADMIN_NAME", "Professor(a)")
