import os

from dotenv import load_dotenv

load_dotenv()   #Le a chave da api

GROQ_API_KEY = os.getenv("GROQ_API_KEY")    
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b") #Pega o modelo de variavel que eu quero, se ela nao existir, usa um valor padrao (que nesse caso é o openai/gpt-oss-120b)
CORS_ORIGINS = os.getenv("CLAREIA_CORS_ORIGINS", "http://localhost:3000").split(",")        #O split permite varios sites separados por virgula