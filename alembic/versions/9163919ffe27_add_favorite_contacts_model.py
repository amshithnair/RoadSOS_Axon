"""Add favorite contacts model

Revision ID: 9163919ffe27
Revises: 1a2b3c4d5e6f
Create Date: 2026-05-30 18:45:30.772144

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '9163919ffe27'
down_revision = '1a2b3c4d5e6f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create favorite_contacts table safely
    op.create_table(
        'favorite_contacts',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('telegram_chat_id', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        op.f('ix_favorite_contacts_user_id'),
        'favorite_contacts',
        ['user_id'],
        unique=False
    )


def downgrade() -> None:
    # Drop index and table safely
    op.drop_index(op.f('ix_favorite_contacts_user_id'), table_name='favorite_contacts')
    op.drop_table('favorite_contacts')
