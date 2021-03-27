"""empty message

Revision ID: ddb3bcf7c50d
Revises: 7e5c3bc4981a
Create Date: 2021-03-26 00:54:51.440686

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ddb3bcf7c50d'
down_revision = '7e5c3bc4981a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'first_name')
    op.drop_column('user', 'gender')
    op.drop_column('user', 'mother_family_name')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('mother_family_name', sa.VARCHAR(length=50), autoincrement=False, nullable=True))
    op.add_column('user', sa.Column('gender', sa.VARCHAR(length=50), autoincrement=False, nullable=True))
    op.add_column('user', sa.Column('first_name', sa.VARCHAR(length=50), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
