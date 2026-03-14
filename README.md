# Demo Video
https://drive.google.com/drive/folders/152ClGcH6XHNA40fqyk6eESE8FZZ_tMAK?usp=sharing

---

# Fabriq ERP: A Modular Manufacturing Management Web Application

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

Fabriq ERP is a centralized, real-time inventory management web application that replaces manual registers, Excel sheets, and scattered tracking with a streamlined digital workflow for warehouse operations.

This project was developed as part of a Masters program, showcasing a modern architecture for Enterprise Resource Planning (ERP) systems.

**Live Demo:** `[Link to your deployed application]` (Coming Soon)

---

## Key Features

- **Complete Product Management:** Create products with SKUs, categories, units of measure, and reordering rules
- **Receipts (Incoming Stock):** Track vendor deliveries with automatic stock increases
- **Delivery Orders (Outgoing Stock):** Manage customer shipments with pick/pack/validate workflow
- **Internal Transfers:** Move stock between warehouses, racks, or locations with full audit trail
- **Stock Adjustments:** Correct inventory mismatches from physical counts or damage
- **Real-Time Dashboard:** KPIs showing stock levels, low stock alerts, pending operations
- **Multi-Warehouse Support:** Track inventory across multiple locations
- **Role-Based Access:** Secure access for Inventory Managers and Warehouse Staff
- **Smart Search & Filters:** Filter by document type, status, warehouse, or product category


---

## Technology Stack

| Component      | Technology                                    |
| -------------- | --------------------------------------------- |
| **Frontend** | React, React Router, Axios, Material-UI       |
| **Backend** | Django, Django REST Framework, Django JWT     |
| **Database** | PostgreSQL                                    |
| **Deployment** | Docker (Optional), Gunicorn, Nginx            |

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (v18.x or later)
* Python (v3.10.x or later)
* PostgreSQL (v14 or later)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/](https://github.com/)[your-username]/[your-repo-name].git
    cd [your-repo-name]
    ```

2.  **Backend Setup (Django):**

    ```sh
    # Navigate to the backend directory
    cd backend

    # Create and activate a virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`

    # Install dependencies
    pip install -r requirements.txt

    # Set up your environment variables
    # Create a .env file in the 'backend' directory and add the following:
    # SECRET_KEY=your_django_secret_key
    # DEBUG=True
    # DB_NAME=your_db_name
    # DB_USER=your_db_user
    # DB_PASSWORD=your_db_password
    # DB_HOST=localhost
    # DB_PORT=5432

    # Run database migrations
    python manage.py migrate

    # Start the backend server
    python manage.py runserver
    # The backend will be running at [http://127.0.0.1:8000](http://127.0.0.1:8000)
    ```

3.  **Frontend Setup (React):**

    ```sh
    # Open a new terminal and navigate to the frontend directory
    cd frontend

    # Install dependencies
    npm install

    # Set up your environment variables
    # Create a .env file in the 'frontend' directory and add the following:
    # REACT_APP_API_BASE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

    # Start the frontend development server
    npm start
    # The frontend will be running at http://localhost:3000
    ```

---

## 📋 Application Workflow

**Product Setup → Define SKUs & Reorder Rules**  
└── Create products with categories, UOM, reorder levels  

**Receive Goods → Stock +Qty (Receipt)**  
└── Vendor delivery → Automatic stock increase  

**Internal Move → Location Change (Transfer)**  
└── Warehouse A → Warehouse B → Audit trail logged  

**Ship Goods → Stock -Qty (Delivery)**  
└── Pick → Pack → Validate → Stock automatically reduced  

**Physical Count → Adjust Differences**  
└── Counted vs Recorded → Automatic adjustment logged  

**Monitor → Real-time Dashboard KPIs**  
└── Low stock alerts, pending operations, stock levels

---

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

John Abraham Chandy - johnabrahamchandy@gmail.com

Github Link: [https://github.com/JACindia]
