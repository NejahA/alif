from flask import Flask
from flask_app import app
from flask import redirect, render_template, request
from ..Models.maker import FilmMaker


@app.route('/')
def index():
    return  render_template('maker.html')

@app.route("/create/maker", methods=["POST"])
def create():
    data={
        "name": request.form['name']
    }
    FilmMaker.save(data)
    return redirect("/")