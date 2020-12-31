from flask import Flask, render_template
import psycopg2

app = Flask(__name__)

connection = psycopg2.connect(
    database="gps_event_logs2017_trajectory",
    user="postgres",
    password="ngochaiOP99",
    host="localhost")
cur = connection.cursor()


class Trajectory:
    def __init__(self, trajline_id, start_time, end_time, address_head, address_tail, lat_head, lon_head, lat_tail,
                 lon_tail):
        self.trajline_id = trajline_id
        self.start_time = start_time
        self.end_time = end_time
        self.address_head = address_head
        self.address_tail = address_tail
        self.lat_head = lat_head
        self.lon_head = lon_head
        self.lat_tail = lat_tail
        self.lon_tail = lon_tail


class Outlier:
    def __init__(self, outlier_id, trajline_id):
        self.outlier_id = outlier_id
        self.trajline_id = trajline_id


# get trajline list
cur.execute('select * from a_final_result')
connection.commit()
print('success')
traj_list = []
for row in cur:
    temp = Trajectory(row[0], row[1], row[2], row[7], row[8], row[3], row[4], row[5], row[6])
    traj_list.append(temp)

# get outlier list
cur.execute('select * from a_final_outlier_table')
connection.commit()
outlier_list = []
for row in cur:
    temp = Outlier(row[0], row[1])
    outlier_list.append(temp)
print('ready')


@app.route('/')
def index():
    return render_template('index.html', list=traj_list, outliers=outlier_list)


if __name__ == '__main__':
    app.run(debug=True)
# print(connection.info.dbname)
