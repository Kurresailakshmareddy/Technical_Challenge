# Formula 1 Data Visualization Web Application

## Overview

This web application provides a comprehensive visualization of Formula 1 race data sourced from the Ergast API. Users can explore a wide range of Formula 1 information, including race results, standings, driver and team profiles, schedules, and circuit details. The application features interactive elements and detailed visualizations designed to enhance the user’s understanding of race events and statistics. Inspired by the official Formula 1 website, this application aims to deliver an engaging and informative experience for all F1 enthusiasts.

## Features

- **Home Page**:
  - Overview of F1 with interactive sections for 2024 stats, schedule, and circuit details.
  - Quick access to other pages via card sections and a footer with navigation links.

- **Season Results Page**:
  - View results for races, qualifying sessions, and sprint qualifying.
  - Switch between different seasons and race events.
  - Interactive tables with links to driver stats and biographies.

- **Season Standings Page**:
  - Display driver and constructor standings, lap summaries, and pit stop data.
  - Filter by season and race, with options to view details for specific laps and stops.
  - Interactive elements for driver and constructor details.

- **Driver/Riders Page**:
  - List of drivers with nationality and date of birth.
  - Search functionality for specific drivers.
  - Detailed driver pages with circuit information and graphical statistics.

- **Team/Constructors Page**:
  - List of teams with nationality and performance stats.
  - Search functionality for specific teams.
  - Detailed team pages with historical and current driver data.
  
- **Season Schedule Page**:
  - Default view of the current year's schedule.
  - Countdown timer for the next race.
  - Search by year and sort by circuit nationality.
  - Interactive race and circuit details with historical data.

- **Circuits Page**:
  - List of circuits with details about their location and history.
  - Search functionality for specific circuits.
  - Detailed circuit pages with historical race data and statistics.
  
## Important Notes about the web application

- **Note:** Give few minutes time to load the page, as API is taking time for the request.
- **Note:** Too many request for API in a single time, can cause request block and displays the "Error fetching the data".
- **Note:** This web app is designed for desktop, laptop viewing and supports in all modern browsers.
- **Note:** External links and images used in the application are for demo purposes only. The external links and images copy rights holds by the official websites. This application has no responsible for those rights issues.
- **Note:** This web app is build for demo purposes only and has no responsible for external copy rights and the data.

## Installation

To set up and run this project locally, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Kurresailakshmareddy/Technical_Challenge.git

2. **Ensure Docker is Installed**

   Make sure Docker is installed on your system before running the application. You can download it from [Docker's official website](https://www.docker.com/products/docker-desktop) as per your OS.

3. **Open a Terminal**

   Access your terminal or command prompt.

4. **Navigate to the Project Directory:**

   ```bash
   cd 'File Name'  **Ex:** cd f1-data-visualization-web-app

## Running the Application with Docker

1. **Build the Docker Image:**

   ```bash
    docker build -t 'your specific image name' .  **Ex:** docker build -t f1-data-visualization .

2. **Run the Docker Container:**

   ```bash
    docker run -p 8080:8080 'your specific image name'   **Ex:** docker run -p 8080:8080 f1-data-visualization

3. **Access the application**

   - Open your web browser and navigate to <http://localhost:8080>.
   - Open your web browser and navigate with your IP address link provided in terminal after entering the command "(docker run -p 8080:8080 'your specific image name')". **Ex:** <http://111.0.0.0:8080>

## Data Source

- Formula 1 Data: Ergast API (<http://ergast.com/mrd/>)
- Information: Wikipedia API (<https://en.wikipedia.org/api/rest_v1/>)

## Acknowledgments

- **Images:** Thank you to Google Images and Formula 1 Official Website for providing images used in the application.
- **External Data:** Thank you to Formula 1 Official Website for providing external links used in the application.
- Thanks to the developers and maintainers of the Ergast API and Wikipedia API for providing valuable data.

## License

This project does not have a specified license. Feel free to use and modify the code as needed.
