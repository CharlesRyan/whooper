import json
import pandas as pd

from modules.whoop_module import whoop_module

class main:

  def __init__(self):
    self.CRED_PATH = 'backend/creds.ini'
    self.whoop_df = self.get_whoop_data()
    self.gsheet_df = self.get_gsheet_data()

  def get_whoop_data(self):
    whoop = whoop_module()
    # refetch = False
    refetch = True
    if refetch: whoop.authorize(self.CRED_PATH)

    # return whoop.get_summary_data(refetch)
    return whoop.get_all_data(refetch)


    # TODO: move this into gsheet module after frontend integration
  def get_gsheet_data(self):
    # transform gsheet date to whoop format so the datasets can be joined based on date
    # whoop date format: 2020-06-04

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
    # TODO: make this more dynamic, maybe check types of a random row
      # check if cell contents == 'TRUE' or 'FALSE', and try: isNaN(int(cell))
    numerical_items = ['Moda', 'Coffee', 'Meditation', 'Alcohol']
    for itm in numerical_items:
      gsheet_df[itm] = gsheet_df[itm].map(lambda d: int(d) if len(d) else 0)

    boolean_items = ['Nap', 'Journal', 'Morning walk', 'Morning sun', 'Weighted blanket', 'MD']
    for itm in boolean_items:
      gsheet_df[itm] = gsheet_df[itm].map(lambda d: 1 if d == 'TRUE' else 0)

    prev_day_items = ['Moda', 'Coffee', 'Meditation', 'Alcohol', 'Morning walk', 'Morning sun', 'Weighted blanket', 'MD']
    for itm in prev_day_items:
      new_col_name = itm + ' - p'
      gsheet_df[new_col_name] = gsheet_df[itm].copy()
      gsheet_df[new_col_name].shift(1)

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

    # print(self.whoop_df)
    # print(all_data.head())
    # print(all_data)
    # print(all_data.corr())



main = main()
main.analyze()