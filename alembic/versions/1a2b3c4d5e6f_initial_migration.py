"""Initial migration

Revision ID: 1a2b3c4d5e6f
Revises:
Create Date: 2026-05-30 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geography

# revision identifiers, used by Alembic.
revision = "1a2b3c4d5e6f"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Service Category Enum
    op.execute(
        "CREATE TYPE service_category AS ENUM ('HOSPITAL', 'POLICE', 'AMBULANCE', 'TOWING', 'TYRE_SHOP', 'CAR_DEALER')"
    )

    # Services table
    op.create_table(
        "services",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                "HOSPITAL",
                "POLICE",
                "AMBULANCE",
                "TOWING",
                "TYRE_SHOP",
                "CAR_DEALER",
                name="service_category",
            ),
            nullable=False,
        ),
        sa.Column(
            "location", Geography(geometry_type="POINT", srid=4326), nullable=False
        ),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("country_code", sa.String(length=2), nullable=False),
        sa.Column(
            "phones", postgresql.ARRAY(sa.String()), server_default="{}", nullable=True
        ),
        sa.Column("open_24h", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("rating", sa.Numeric(precision=2, scale=1), nullable=True),
        sa.Column("osm_id", sa.BigInteger(), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_services_location",
        "services",
        ["location"],
        unique=False,
        postgresql_using="gist",
    )

    # Users table
    op.create_table(
        "user",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("hashed_password", sa.String(length=1024), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_superuser", sa.Boolean(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_email"), "user", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_email"), table_name="user")
    op.drop_table("user")
    op.drop_index("idx_services_location", table_name="services")
    op.drop_table("services")
    op.execute("DROP TYPE service_category")
