from google import genai
client = genai.Client(api_key="test-placeholder-key")
print("client.models exists:", hasattr(client, "models"))
print("client.aio exists:", hasattr(client, "aio"))
