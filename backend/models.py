import uuid
from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

todo_tags = db.Table(
    "todo_tags",
    db.Column("todo_id", db.Integer, db.ForeignKey("todos.id"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id"), primary_key=True),
)


class Board(db.Model):
    __tablename__ = "boards"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False, default="My Board")
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    todos = db.relationship(
        "Todo", backref="board", lazy=True, cascade="all, delete-orphan"
    )
    tags = db.relationship(
        "Tag", backref="board", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at.isoformat(),
        }


class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    board_id = db.Column(
        db.String(36), db.ForeignKey("boards.id"), nullable=False, index=True
    )
    name = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(7), nullable=False, default="#6366f1")

    def to_dict(self):
        return {
            "id": self.id,
            "boardId": self.board_id,
            "name": self.name,
            "color": self.color,
        }


class Todo(db.Model):
    __tablename__ = "todos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    board_id = db.Column(
        db.String(36), db.ForeignKey("boards.id"), nullable=False, index=True
    )
    title = db.Column(db.String(500), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    tags = db.relationship("Tag", secondary=todo_tags, lazy="subquery", backref="todos")

    def to_dict(self):
        return {
            "id": self.id,
            "boardId": self.board_id,
            "title": self.title,
            "completed": self.completed,
            "sort_order": self.sort_order,
            "created_at": self.created_at.isoformat(),
            "tags": [t.to_dict() for t in self.tags],
        }
