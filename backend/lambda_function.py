import json
import pandas as pd

from modules.whoop_module import whoop_module
from modules.sheet_module import sheet_module

class Main:

  def __init__(self, sheet=True, whoop=True):
    self.CRED_PATH = 'backend/creds.ini'
    if whoop: self.whoop_df = self.get_whoop_data()
    if sheet: self.sheet_df = self.get_sheet_data()

  def get_whoop_data(self):
    whoop = whoop_module()
    refetch = False
    # refetch = True
    if refetch: whoop.authorize(self.CRED_PATH)

    return whoop.get_summary_data(refetch)
    # return whoop.get_all_data(refetch)


  def get_sheet_data(self):
    # transform sheet date to whoop format so the datasets can be joined based on date
    # whoop date format: 2020-06-04

    with open('backend/sample_data/gsheet.json') as f:
      sample_sheet_data = json.load(f)

    sheet = sheet_module()
    return sheet.parse_data(sample_sheet_data)


  def analyze(self):
    # 
    pd.set_option("display.max_rows", None, "display.max_columns", None)
    # pd.set_option("display.max_rows", None)
    # 

    # mish sheet data and whoop_data together based on matching the day column
    all_data = pd.merge(self.whoop_df, self.sheet_df, on='day')

    all_data.to_csv('backend/output/merged_data.csv', index=False)
    print('Output sent to csv')

    correlations = all_data.corr()

    correlations.to_json('backend/output/correlations.json')
    print('Corr output sent to json')

    # print(self.whoop_df)
    # print(all_data.head())
    # print(all_data)
    # print(all_data.corr())
    # print(all_data.dtypes)


  def sheet_output(self):
    pd.set_option("display.max_rows", None, "display.max_columns", None)
    print('----------------------')
    print(self.sheet_df)
    # print(self.sheet_df.corr())
    # print(self.sheet_df.dtypes)

############# dev
# whoop = False
whoop = True
sheet = True

main = Main()
if whoop and sheet: main.analyze()
if sheet and not whoop: main.sheet_output()
############# dev

def lambda_handler(event, context):
  main = Main(event)
  return {
        'statusCode': 200,
        'body': json.dumps('responseObj')
    }