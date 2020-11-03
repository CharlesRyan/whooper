import json
import pandas as pd

from whoop_module import whoop_module


CRED_PATH = 'backend/creds.ini'

with open('backend/sample_data/gsheet.json') as f:
  sample_gsheet_data = json.load(f)

# whoop = whoop_module()
# whoop.authorize(CRED_PATH)
# whoop_data = whoop.get_all_data()


# TODO: move this data transformation into gsheet module
# transform gsheet date to whoop format so the datasets can be joined based on date
# whoop date format: 2020-06-04
for idx, entry in enumerate(sample_gsheet_data['values']):
  # first item in values is list of column headers
  if idx > 0:
    # first item in entry is the date
    date_parts = entry[0].split('/')
    # add 0 to single digit numbers
    day = f'0{date_parts[1]}' if len(date_parts[1]) == 1 else date_parts[1]
    month = f'0{date_parts[0]}' if len(date_parts[0]) == 1 else date_parts[0]

    year = '2020' if '2021' not in entry else '2021'
    entry[0] = f'{year}-{month}-{day}'

# create gsheet DF
gsheet_data_headers = sample_gsheet_data['values'][0:1]
gsheet_data_rows = sample_gsheet_data['values'][1:]
gsheet_df = pd.DataFrame(gsheet_data_rows, columns=gsheet_data_headers)
print(gsheet_df)


# mish gsheet data into whoop_data dataframe
# merge based on matching the day column
# whoop_data.merge(gsheet_df, on='day')