import argparse
import getpass
import sys
from app.core.database import SessionLocal
from app.schemas.user import UserCreate
from app.services.auth_service import auth_service


def main() -> None:
    """CLI tool to securely create or seed an admin user."""
    parser = argparse.ArgumentParser(description="Create a new administrator user.")
    parser.add_argument("--username", help="Admin username")
    parser.add_argument("--email", help="Admin email address")
    parser.add_argument("--password", help="Admin password (if omitted, prompts securely)")

    args = parser.parse_args()

    username = args.username or input("Enter admin username: ").strip()
    email = args.email or input("Enter admin email: ").strip()
    
    if args.password:
        password = args.password
    else:
        password = getpass.getpass("Enter admin password (min 8 chars): ").strip()
        confirm_password = getpass.getpass("Confirm admin password: ").strip()
        if password != confirm_password:
            print("Error: Passwords do not match.", file=sys.stderr)
            sys.exit(1)

    user_in = UserCreate(username=username, email=email, password=password)

    db = SessionLocal()
    try:
        user = auth_service.create_user(db, user_in)
        print(f"Success: Administrator '{user.username}' (ID: {user.id}) created successfully.")
    except Exception as exc:
        print(f"Failed to create admin: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
