{-# LANGUAGE OverloadedStrings #-}

module Main where

import System.IO
import Data.Aeson (Value)
import Data.Aeson.Lens (key, _Value, _String)
import Control.Lens
import Network.Wreq (defaults, getWith, header,responseBody, responseStatus, statusCode, Options)
import Data.ByteString.Char8 (pack)
import System.Environment (getEnv)


baseUrl :: String
baseUrl = "https://api.youneedabudget.com/v1/"

payeesUrl :: String -> String
payeesUrl budgetId = baseUrl ++ "budgets/" ++ budgetId ++ "/payees"

opts :: String -> Network.Wreq.Options
opts token = defaults & header "Authorization" .~ [pack $ "Bearer " ++ token]

getStarbucksPayeeIds :: String -> String -> IO (Maybe Value)
getStarbucksPayeeIds token budgetId = do
  r <- getWith (opts token) (payeesUrl budgetId)
  return (r ^? responseBody . key "data" . key "payees")



main :: IO ()
main = do
  token <- getEnv("YNAB_ACCESS_TOKEN")
  budgetId <- getEnv("YNAB_BUDGET_ID")
  payeeIds <- getStarbucksPayeeIds token budgetId
  return ()
