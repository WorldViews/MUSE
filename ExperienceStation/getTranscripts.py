
from youtube_transcript_api import YouTubeTranscriptApi
import json

video_id = "Bnmkaon2tVo"
ts = YouTubeTranscriptApi.get_transcript(video_id)
#tsObj = json.loads(ts)
ts = json.dumps(ts, indent=3)
print("Transcript:\n", ts)

video_id = "BEojdKY3gIk"
ts = YouTubeTranscriptApi.get_transcript(video_id)
ts = json.dumps(ts, indent=3)
print("Transcript:\n", ts)

