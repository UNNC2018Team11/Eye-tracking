"""
Demonstration of the GazeTracking library.
Check the README.md for complete documentation.
"""

import csv
import time

import cv2
from numpy import *
import numpy as np

from gaze_tracking import GazeTracking

gaze = GazeTracking()
webcam = cv2.VideoCapture(0)

path = "coor.csv"
gaze_point_x = None
gaze_point_y = None
init_time = ""
list_x = []
list_y = []
all_x = []
all_y = []
watchingTime = [[0] * 24 for i in range(10)]


def countPoints(point_x, point_y):
    """
    show the times that gazing points are located in different area
    the screen is divided into 9x24 areas
    Arguments:
        point_x: x coordinate of gazing point
        point_y: y coordinate of gazing point
    """
    if point_x is not None and point_y is not None:
        a = (int)(point_x / 100)
        b = (int)(10 - point_y / 120)
        watchingTime[b][a] = watchingTime[b][a] + 1
        path = "count.csv"
        with open(path, 'w', newline='') as f:
            csv_write = csv.writer(f, lineterminator='\n')
            data_row = watchingTime
            csv_write.writerow(data_row)


def read_std_csv():
    """
    read 'coor.csv' which contains the coordinates of all the gazing points
    calculate the standard deviation and write std into another csv file
    """
    with open('coor.csv', 'r') as f:
        reader = csv.reader(f)
        for i in reader:
            all_x.append(float(i[0]))
            all_y.append(float(i[1]))
    x_std = np.std(all_x)
    y_std = np.std(all_y)
    write_std(x_std, y_std)


def write_std(x_std, y_std):
    """
    write std of x and y into csv file
    Arguments:
        x_std: standard deviation of x coordinates
        y_std: standard deviation of y coordinates
    """
    path = "std.csv"
    with open(path, 'w', newline='') as f:
        csv_write = csv.writer(f, lineterminator='\n')
        data_row = [x_std, y_std]
        csv_write.writerow(data_row)


def write_csv(point_x, point_y, currenttime):
    '''
    write x, y coordinates of gazing points and time into csv file
    Arguments:
        point_x: x coordinate of gazing point
        point_y: y coordinate of gazing point
        currenttime: time
    '''
    path = "coor.csv"
    with open(path, 'a+', newline='') as f:
        csv_write = csv.writer(f, lineterminator='\n')
        data_row = [point_x, point_y, currenttime]
        csv_write.writerow(data_row)


f = open(path, 'w', newline='')
f.close()

while True:
    # get a new frame from the webcam
    _, frame = webcam.read()

    # send this frame to GazeTracking to analyze it
    gaze.refresh(frame)
    frame = gaze.annotated_frame()

    # if pupils have been detected, calculate the gazing point
    if (gaze.left_gaze_x() is not None and gaze.right_gaze_x() is not None
            and gaze.left_gaze_y() is not None and gaze.right_gaze_y() is not None):
        gaze_point_x = (gaze.left_gaze_x() + gaze.right_gaze_x()) / 2
        gaze_point_y = (gaze.left_gaze_y() + gaze.right_gaze_y()) / 2

    # # create a new window
    # cv2.namedWindow("Demo", 0)
    # cv2.resizeWindow("Demo", 1920, 1080)
    # cv2.imshow("Demo", frame)

    # get the current time
    curtime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))

    # store coordinates in one second
    list_x.append(gaze_point_x)
    list_y.append(gaze_point_y)
    # if pass to the next sec, calculate the mean of stored coordinates
    if curtime != init_time:
        init_time = curtime
        av_x = round(mean(list_x), 2)
        av_y = round(mean(list_y), 2)
        # write into csv file
        write_csv(av_x, av_y, curtime)
        # count the times of gazing on different area
        countPoints(av_x, av_y)
        # initialize lists
        list_x = []
        list_y = []

    # calculate standard deviation and write into a csv file
    read_std_csv()

    if cv2.waitKey(1) == 27:
        break