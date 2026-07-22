FROM python:3.11-slim

WORKDIR /app

# Install deps in a separate layer so torch is cached between deploys
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code (changes frequently — comes after deps)
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "warning"]
