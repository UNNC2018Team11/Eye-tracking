"""
Demonstration of the GazeTracking library.
Check the README.md for complete documentation.
"""

import csv
import time

import cv2
from numpy import *
from datetime import datetime

from gaze_tracking import GazeTracking

gaze = GazeTracking()
webcam = cv2.VideoCapture(0)

path = "aa.csv"
gaze_point_x = None
gaze_point_y = None
init_time = ""
list_x = []
list_y = []


# def average_per_sec(time, x, y):
#     list_x.append(x)
#     list_y.append(y)
#     if time != init_time:
#         init_time = curtime


def write_csv(point_x, point_y, currenttime):
    path = "aa.csv"
    with open(path, 'a+', newline='') as f:
        csv_write = csv.writer(f, lineterminator='\n')
        data_row = [point_x, point_y, currenttime]
        csv_write.writerow(data_row)


f = open(path, 'w', newline='')
f.close()

while True:
    # We get a new frame from the webcam
    _, frame = webcam.read()

    # We send this frame to GazeTracking to analyze it
    gaze.refresh(frame)

    frame = gaze.annotated_frame()
    text = ""

    # if gaze.is_blinking():
    #     text = "Blinking"
    # elif gaze.is_right():
    #     text = "Looking right"
    # elif gaze.is_left():
    #     text = "Looking left"
    # elif gaze.is_center():
    #     text = "Looking center"
    #
    # cv2.putText(frame, text, (90, 60), cv2.FONT_HERSHEY_DUPLEX, 1.6, (147, 58, 31), 2)
    #
    # left_pupil = gaze.pupil_left_coords()
    # right_pupil = gaze.pupil_right_coords()
    # cv2.putText(frame, "Left pupil:  " + str(left_pupil), (90, 130), cv2.FONT_HERSHEY_DUPLEX, 0.9, (147, 58, 31), 1)
    # cv2.putText(frame, "Right pupil: " + str(right_pupil), (90, 165), cv2.FONT_HERSHEY_DUPLEX, 0.9, (147, 58, 31), 1)

    # left_point = gaze.left_gaze()
    # right_point = gaze.right_gaze()

    # left_point_x = gaze.left_gaze_x()
    # left_point_y = gaze.left_gaze_y()
    # right_point_x = gaze.right_gaze_x()
    # right_point_y = gaze.right_gaze_y()
    if (gaze.left_gaze_x() is not None and gaze.right_gaze_x() is not None
            and gaze.left_gaze_y() is not None and gaze.right_gaze_y() is not None):
        gaze_point_x = (gaze.left_gaze_x() + gaze.right_gaze_x()) / 2
        gaze_point_y = (gaze.left_gaze_y() + gaze.right_gaze_y()) / 2
    # gaze_point_x = (left_point_x + right_point_x) / 2
    # gaze_point_y = (left_point_y + right_point_y) / 2
    # cv2.putText(frame, "Gaze point:  " + str(left_point), (10, 190), cv2.FONT_HERSHEY_DUPLEX, 0.9, (255, 255, 255), 1)

    cv2.namedWindow("Demo", 0)
    cv2.resizeWindow("Demo", 1920, 1080)
    cv2.imshow("Demo", frame)

    curtime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
    # print("Current time = ", curtime)
    # date = datetime.strptime(curtime, "%Y-%m-%d %H:%M:%S")

    list_x.append(gaze_point_x)
    list_y.append(gaze_point_y)
    if curtime != init_time:
        init_time = curtime
        av_x = mean(list_x)
        av_y = mean(list_y)
        write_csv(av_x, av_y, curtime)
        list_x = []
        list_y = []

    # write_csv(gaze_point_x, gaze_point_y, curtime)

    if cv2.waitKey(1) == 27:
        break
