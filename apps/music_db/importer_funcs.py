"""
Functions related to importing music to the Song DB.
"""
import os
from django.conf import settings
import mutagen
from mutagen.id3 import ID3
from apps.music_db.models import Song

def add_song_to_library(file_name):
    """
    Adds the specified song to the Song library.
    
    file_name: (str) Just the filename (without path).
    """
    print "Importing", file_name
    # Add on the 'music' prefix in the path.
    file_path = os.path.join(settings.MUSIC_DIR_NAME, file_name)
    # Once the Song is created and saved, ID3 tags will be pulled automatically.
    new_song = Song(file=file_path)
    new_song.save()

def scan_music_dir_for_new_songs():
    """
    Scans the media/music directory for new songs. Adds any missing entries.
    """
    for root, dirs, files in os.walk(settings.MUSIC_DIR):
        for file_name in files:           
            file_name = unicode(file_name, "utf-8")
            try:
                file_path = os.path.join(settings.MUSIC_DIR, file_name)
                # If this throws an exception, we might end up ignoring
                # the file.
                ID3(file_path)
            except IOError:
                # This is probably not a music file. Skip it.
                continue
            except mutagen.id3.ID3NoHeaderError:
                # Let the Song model's ID3 tag scanning method handle this one.
                pass
            
            db_file_path = os.path.join(settings.MUSIC_DIR_NAME, file_name)
            try:
                # See if a song already exists with this name in the DB.
                num_matches = Song.objects.filter(file=db_file_path).count()
            except UnicodeDecodeError:
                # This -shouldn't- happen anymore, but don't die if it does.
                print "Unicode Error:", file_name
                continue
            
            if num_matches == 0:
                add_song_to_library(file_name)
