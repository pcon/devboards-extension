#!/usr/bin/env python
import os
import json
import time
import datetime
import urllib2

url = "%s/.json" % (os.environ['FIREBASE_URL'], )

req = urllib2.Request(url)
response = urllib2.urlopen(req)
posts = json.loads(response.read())

to_delete = []

expire_time = time.mktime((datetime.datetime.now() - datetime.timedelta(hours = 24)).timetuple()) * 1000

for post_id in posts:
    for user_id in posts[post_id]:
        data = posts[post_id][user_id]
        timestamp = data['timestamp']
        if timestamp < expire_time:
            to_delete.append("%s/%s.json" % (data['post_id'], data['user_id']))

for record in to_delete:
    print "Deleting %s" % (record, )
    url = "%s/%s" % (os.environ['FIREBASE_URL'], record)
    opener = urllib2.build_opener(urllib2.HTTPHandler)
    req = urllib2.Request(url)
    req.get_method = lambda: 'DELETE'
    url = urllib2.urlopen(req)