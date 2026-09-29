from dotenv import dotenv_values
vals = dotenv_values('backend/.env')
print('Keys in .env:', list(vals.keys()))
