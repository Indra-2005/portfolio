"""create projects table

Revision ID: 001_create_projects
Revises: 
Create Date: 2026-09-15 12:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_create_projects'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('short_description', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('technologies', sa.JSON(), nullable=False),
        sa.Column('key_features', sa.JSON(), nullable=True),
        sa.Column('challenges', sa.JSON(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('github_url', sa.String(length=500), nullable=True),
        sa.Column('live_demo_url', sa.String(length=500), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('featured', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('published', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('display_order', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('completion_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_slug'), 'projects', ['slug'], unique=True)
    op.create_index(op.f('ix_projects_featured'), 'projects', ['featured'], unique=False)
    op.create_index(op.f('ix_projects_published'), 'projects', ['published'], unique=False)
    op.create_index(op.f('ix_projects_display_order'), 'projects', ['display_order'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_projects_display_order'), table_name='projects')
    op.drop_index(op.f('ix_projects_published'), table_name='projects')
    op.drop_index(op.f('ix_projects_featured'), table_name='projects')
    op.drop_index(op.f('ix_projects_slug'), table_name='projects')
    op.drop_table('projects')
