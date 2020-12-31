import psycopg2

connection = psycopg2.connect(
    database="gps_event_logs2017_trajectory",
    user="postgres",
    password="ngochaiOP99",
    host="localhost")
cur = connection.cursor()


class Point:
    def __init__(self, lon, lat):
        self.lon = lon
        self.lat = lat

    def __repr__(self):
        return self.lon, self.lat

    def __eq__(self, other):
        if self.lon == other.lon and self.lat == other.lat:
            return True
        else:
            return False


class Triangle_Address:
    def __init__(self, id, head, body, tail):
        self.id = id
        self.head = head
        self.body = body
        self.tail = tail


class Address:
    def __init__(self, point, add):
        self.point = point
        self.address = add

    def __repr__(self):
        return self.point.__repr__(), self.address


class Point_Address:
    def __init__(self, head_point, body_point, tail_point):
        self.head_point = head_point
        self.body_point = body_point
        self.tail_point = tail_point

    def __repr__(self):
        return self.head_point.__repr__(), self.body_point.__repr__(), self.tail_point.__repr__()


# get outlier address
cur.execute('select * from a_outlier_table where trajline_id = 9')
connection.commit()
triangle_add_list = []
for row in cur:
    temp = Triangle_Address(row[0], row[1], row[2], row[3])
    triangle_add_list.append(temp)

# get address and point
cur.execute('select lon,lat,address from a_address where trajline_id = 9')
connection.commit()
address_list = []
count = 0
for row in cur:
    temp_point = Point(row[0], row[1])
    temp_add = row[2]
    temp_add_point = Address(temp_point, temp_add)
    address_list.append(temp_add_point)
    count += 1
print(len(triangle_add_list))
# print(len(address_list))
# for i in address_list:
#     print(i.__repr__())

# transfer address to point
point_address_list = []
temp_head_point = []
temp_body_point = []
temp_tail_point = []
for outlier in triangle_add_list:
    temp_head = outlier.head
    temp_body = outlier.body
    temp_tail = outlier.tail
    for item in address_list:
        if item.address == temp_head:
            temp = item.point
            temp_head_point.append(temp)
        if item.address == temp_body:
            temp = item.point
            temp_body_point.append(temp)
        if item.address == temp_tail:
            temp = item.point
            temp_tail_point.append(temp)

# print(len(address_list))
# print(len(temp_head_point))
for _head, _body, _tail in zip(temp_head_point, temp_body_point, temp_tail_point):
    temp = Point_Address(_head, _body, _tail)
    point_address_list.append(temp)
#
# # for i in point_address_list:
# #     print(i.__repr__())
# # print(len(point_address_list))

# get list of point in trajline
cur.execute('select * from coordinate_table where trajline_id = 9')
connection.commit()
point_in_trajline_list = []
for row in cur:
    temp = Point(row[1], row[2])
    point_in_trajline_list.append(temp)

trajline_outlier_list = []
h_index_list = []
b_index_list = []
t_index_list = []
for item in point_address_list:
    h_point = item.head_point
    b_point = item.body_point
    t_point = item.tail_point
    for i in range(len(point_in_trajline_list)):
        if h_point.__eq__(point_in_trajline_list[i]):
            h_index = i
            h_index_list.append(h_index)
        if b_point.__eq__(point_in_trajline_list[i]):
            b_index = i
            b_index_list.append(b_index)
        if t_point.__eq__(point_in_trajline_list[i]):
            t_index = i
            t_index_list.append(t_index)

for h, b, t in zip(h_index_list, b_index_list, t_index_list):
    temp_outlier_list = [h, b, t]
    trajline_outlier_list.append(temp_outlier_list)

for i in trajline_outlier_list:
    print(i)
print(len(trajline_outlier_list))
