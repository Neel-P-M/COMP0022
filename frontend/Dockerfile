FROM node:18-alpine

# Install Python and dependencies
RUN apk add --no-cache python3 py3-pip python3-dev build-base

# Create a virtual environment directly in the working directory
WORKDIR /app

# Set up Python virtual environment
RUN python3 -m venv /app/venv
RUN . /app/venv/bin/activate
ENV PATH="/app/venv/bin:$PATH"

# Install Python packages in the virtual environment
RUN /app/venv/bin/pip3 install mysql-connector-python pandas numpy scikit-learn

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Make sure your script knows where to find the Python executable
ENV PYTHON_PATH="/app/venv/bin/python3"

EXPOSE 3000

CMD ["npm", "run", "dev", "--turbopack"]