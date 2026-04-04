from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from config import Config
from models import db, Board, Todo, Tag, todo_tags


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()
        try:
            with db.engine.connect() as conn:
                result = conn.execute(db.text("PRAGMA table_info(todos)"))
                columns = [row[1] for row in result]
                if columns and "sort_order" not in columns:
                    conn.execute(db.text("ALTER TABLE todos ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0"))
                    conn.commit()
        except Exception:
            pass

    @app.post("/api/boards")
    def create_board():
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "My Board").strip()[:120]
        board = Board(name=name)
        db.session.add(board)
        db.session.commit()
        return jsonify(board.to_dict()), 201

    @app.get("/api/boards/<board_id>")
    def get_board(board_id):
        board = db.session.get(Board, board_id)
        if not board:
            abort(404, description="Board not found")
        return jsonify(board.to_dict())

    @app.patch("/api/boards/<board_id>")
    def update_board(board_id):
        board = db.session.get(Board, board_id)
        if not board:
            abort(404, description="Board not found")
        data = request.get_json(silent=True) or {}
        if "name" in data:
            board.name = (data["name"] or "My Board").strip()[:120]
        db.session.commit()
        return jsonify(board.to_dict())

    @app.get("/api/boards/<board_id>/todos")
    def get_todos(board_id):
        board = db.session.get(Board, board_id)
        if not board:
            abort(404, description="Board not found")
        todos = Todo.query.filter_by(board_id=board_id).order_by(Todo.sort_order, Todo.id).all()
        return jsonify([t.to_dict() for t in todos])

    @app.post("/api/boards/<board_id>/todos")
    def create_todo(board_id):
        board = db.session.get(Board, board_id)
        if not board:
            abort(404, description="Board not found")
        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        if not title:
            abort(400, description="Title is required")
        if len(title) > 500:
            abort(400, description="Title too long")
        max_order = db.session.query(db.func.coalesce(db.func.max(Todo.sort_order), -1)).filter_by(board_id=board_id).scalar()
        todo = Todo(board_id=board_id, title=title, completed=bool(data.get("completed", False)), sort_order=max_order + 1)
        db.session.add(todo)
        db.session.commit()
        return jsonify(todo.to_dict()), 201

    @app.patch("/api/boards/<board_id>/todos/<int:todo_id>")
    def update_todo(board_id, todo_id):
        todo = Todo.query.filter_by(id=todo_id, board_id=board_id).first()
        if not todo:
            abort(404, description="Todo not found")
        data = request.get_json(silent=True) or {}
        if "title" in data:
            title = (data["title"] or "").strip()
            if not title:
                abort(400, description="Title is required")
            if len(title) > 500:
                abort(400, description="Title too long")
            todo.title = title
        if "completed" in data:
            todo.completed = bool(data["completed"])
        db.session.commit()
        return jsonify(todo.to_dict())

    @app.delete("/api/boards/<board_id>/todos/<int:todo_id>")
    def delete_todo(board_id, todo_id):
        todo = Todo.query.filter_by(id=todo_id, board_id=board_id).first()
        if not todo:
            abort(404, description="Todo not found")
        db.session.delete(todo)
        db.session.commit()
        return "", 204

    @app.delete("/api/boards/<board_id>/todos/completed")
    def clear_completed(board_id):
        board = db.session.get(Board, board_id)
        if not board:
            abort(404, description="Board not found")
        Todo.query.filter_by(board_id=board_id, completed=True).delete()
        db.session.commit()
        todos = Todo.query.filter_by(board_id=board_id).order_by(Todo.sort_order, Todo.id).all()
        return jsonify([t.to_dict() for t in todos])

    @app.get("/api/boards/<board_id>/tags")
    def get_tags(board_id):
        board = db.session.get(Board, board_id)
        if not board:
            abort(404, description="Board not found")
        tags = Tag.query.filter_by(board_id=board_id).order_by(Tag.id).all()
        return jsonify([t.to_dict() for t in tags])

    @app.post("/api/boards/<board_id>/tags")
    def create_tag(board_id):
        board = db.session.get(Board, board_id)
        if not board:
            abort(404, description="Board not found")
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        if not name:
            abort(400, description="Tag name is required")
        if len(name) > 50:
            abort(400, description="Tag name too long")
        color = (data.get("color") or "#6366f1").strip()
        if not color.startswith("#") or len(color) != 7:
            abort(400, description="Invalid color format")
        tag = Tag(board_id=board_id, name=name, color=color)
        db.session.add(tag)
        db.session.commit()
        return jsonify(tag.to_dict()), 201

    @app.patch("/api/boards/<board_id>/tags/<int:tag_id>")
    def update_tag(board_id, tag_id):
        tag = Tag.query.filter_by(id=tag_id, board_id=board_id).first()
        if not tag:
            abort(404, description="Tag not found")
        data = request.get_json(silent=True) or {}
        if "name" in data:
            name = (data["name"] or "").strip()
            if not name:
                abort(400, description="Tag name is required")
            if len(name) > 50:
                abort(400, description="Tag name too long")
            tag.name = name
        if "color" in data:
            color = (data["color"] or "").strip()
            if not color.startswith("#") or len(color) != 7:
                abort(400, description="Invalid color format")
            tag.color = color
        db.session.commit()
        return jsonify(tag.to_dict())

    @app.delete("/api/boards/<board_id>/tags/<int:tag_id>")
    def delete_tag(board_id, tag_id):
        tag = Tag.query.filter_by(id=tag_id, board_id=board_id).first()
        if not tag:
            abort(404, description="Tag not found")
        db.session.delete(tag)
        db.session.commit()
        return "", 204

    @app.post("/api/boards/<board_id>/todos/<int:todo_id>/tags/<int:tag_id>")
    def add_tag_to_todo(board_id, todo_id, tag_id):
        todo = Todo.query.filter_by(id=todo_id, board_id=board_id).first()
        if not todo:
            abort(404, description="Todo not found")
        tag = Tag.query.filter_by(id=tag_id, board_id=board_id).first()
        if not tag:
            abort(404, description="Tag not found")
        if tag not in todo.tags:
            todo.tags.append(tag)
            db.session.commit()
        return jsonify(todo.to_dict())

    @app.delete("/api/boards/<board_id>/todos/<int:todo_id>/tags/<int:tag_id>")
    def remove_tag_from_todo(board_id, todo_id, tag_id):
        todo = Todo.query.filter_by(id=todo_id, board_id=board_id).first()
        if not todo:
            abort(404, description="Todo not found")
        tag = Tag.query.filter_by(id=tag_id, board_id=board_id).first()
        if not tag:
            abort(404, description="Tag not found")
        if tag in todo.tags:
            todo.tags.remove(tag)
            db.session.commit()
        return jsonify(todo.to_dict())

    @app.put("/api/boards/<board_id>/todos/reorder")
    def reorder_todos(board_id):
        board = db.session.get(Board, board_id)
        if not board:
            abort(404, description="Board not found")
        data = request.get_json(silent=True) or {}
        order = data.get("order")
        if not isinstance(order, list):
            abort(400, description="order must be a list of todo ids")
        todos = Todo.query.filter_by(board_id=board_id).all()
        todo_map = {t.id: t for t in todos}
        for idx, todo_id in enumerate(order):
            if not isinstance(todo_id, int):
                abort(400, description="order must contain integer ids")
            todo = todo_map.get(todo_id)
            if todo:
                todo.sort_order = idx
        db.session.commit()
        todos = Todo.query.filter_by(board_id=board_id).order_by(Todo.sort_order, Todo.id).all()
        return jsonify([t.to_dict() for t in todos])

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify(error=str(e.description)), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify(error=str(e.description)), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify(error="Internal server error"), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
