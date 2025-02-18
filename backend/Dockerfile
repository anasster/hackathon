# Use Alpine Linux as base image
FROM python:3.12-alpine

# Set working directory
WORKDIR /app

# Install system dependencies required for psutil and other Python packages
RUN apk add --no-cache gcc musl-dev linux-headers

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the FastAPI default port
EXPOSE 8000

# Verify Python version
RUN python --version

# Command to run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]