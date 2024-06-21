from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)
db_file = r"E:\Documents\Python_Scripts\main_env\src\05-May_2024\projeto_si_olymp\src\sistemasOlimpiadas.db"
#db_file = r"sistemasOlimpiadas.db"

def get_data(year):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT medalRank.rankFinal, federation.Noc, medalRank.GoldMedals, medalRank.SilverMedals, medalRank.BronzeMedals, medalRank.TotalMedals, medalRank.AnoOlimp
        FROM medalRank
        JOIN federation ON medalRank.countryId = federation.id_Noc
        WHERE medalRank.AnoOlimp = ?
    ''', (year,))
    data = cursor.fetchall()
    conn.close()
    return data


""" @app.route('/data', methods=['GET'])
def data_route():
    data = get_data(2020)
    return jsonify(data)
 """

@app.route('/data', methods=['GET'])
def data_route():
    yearParam = request.args.get('year')
    data = get_data(yearParam)
    return jsonify(data)


@app.route('/yearFilter', methods=['GET'])
def getYearFiltering():
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute('SELECT DISTINCT anoOlimp FROM MedalRank')
    yeardata = [row[0] for row in cursor.fetchall()]
    conn.close()
    return jsonify(yeardata)

if __name__ == '__main__':
    app.run(debug=True)
