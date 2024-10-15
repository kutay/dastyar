# Use an official Python runtime as a base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install any necessary dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Set environment variables for build information
ARG DEPLOY_DATETIME
ENV DEPLOY_DATETIME=${DEPLOY_DATETIME}

# Expose the port the app runs on
EXPOSE 5000

ENV FLASK_ENV=production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
