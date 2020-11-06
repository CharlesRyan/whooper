import json
import pandas as pd

from whoop_module import whoop_module

class main:

  def __init__(self):
    self.CRED_PATH = 'backend/creds.ini'
    self.whoop_df = self.get_whoop_data()
    self.gsheet_df = self.get_gsheet_data()


  def get_whoop_data(self):
    whoop = whoop_module()
    refetch = False
    # refetch = True
    if refetch: whoop.authorize(self.CRED_PATH)
    return whoop.get_summary_data(refetch)
    # return whoop.get_all_data(refetch)


  def get_gsheet_data(self):
    # transform gsheet date to whoop format so the datasets can be joined based on date
    # whoop date format: 2020-06-04
    # TODO: move this data transformation into gsheet module after frontend integration

    with open('backend/sample_data/gsheet.json') as f:
      sample_gsheet_data = json.load(f)

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
    gsheet_data_headers = sample_gsheet_data['values'][0:1][0]
    gsheet_data_rows = sample_gsheet_data['values'][1:]

    gsheet_df = pd.DataFrame(gsheet_data_rows, columns=gsheet_data_headers)

    # parse data to ints
    # gsheet_df['days'] = gsheet_df['days'].map(lambda d: d[0])

    return gsheet_df


  def analyze(self):
    # 
    pd.set_option("display.max_rows", None, "display.max_columns", None)
    # pd.set_option("display.max_rows", None)
    # 

    # mish gsheet data and whoop_data together based on matching the day column
    all_data = pd.merge(self.whoop_df, self.gsheet_df, on='day')

    all_data.to_csv('backend/output/merged_data.csv', index=False)
    print('Output sent to csv')

    print(all_data.corr())


main = main()
main.analyze()