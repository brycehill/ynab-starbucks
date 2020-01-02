{-# LANGUAGE OverloadedStrings, DeriveGeneric #-}

module Main where

import System.IO
import GHC.Generics
-- improt Data.Map as Map
import Data.Aeson (Value, FromJSON(..), withObject, withArray, (.:))
import Data.Aeson.Lens (key, _Value, _String, _Array, _Object)
import Control.Lens
import Network.Wreq (
  asJSON,
  defaults, getWith, header,responseBody, responseStatus, statusCode,
  Options, Response)
import Data.ByteString.Char8 (ByteString, pack)
import System.Environment (getEnv)


baseUrl :: String
baseUrl = "https://api.youneedabudget.com/v1/"

payeesUrl :: String -> String
payeesUrl budgetId = baseUrl ++ "budgets/" ++ budgetId ++ "/payees"

opts :: String -> Network.Wreq.Options
opts token = defaults & header "Authorization" .~ [pack $ "Bearer " ++ token]


data Payee = Payee { name :: String }
 deriving (Show)


data Payees = List Payee
  deriving (Show, Generic)

-- Idea: typeclass that implements the way to return
-- data.payees/budgets?

instance FromJSON Payees where
  parseJSON = withObject "YNABResp" $ \json -> do
    body <- json .: "data"
    ps <- body .: "payees"
    return $ Payees (map (\p -> Payee (name p)) ps)

-- instance FromJSON Payee where
--   parseJSON = withArray "Payee" $ \json -> do
--     return $ Payee 


getPayees :: String -> String -> IO ()
getPayees token budgetId = do
  r <- asJSON =<< getWith (opts token) (payeesUrl budgetId)
  print $ body (r ^. responseBody)
  -- findSbuxIds r
  -- TODO: Handle errors
  -- putStr $ show ()
  return ()

-- getStarbucksPayeeIds :: String -> String -> IO ()
-- getStarbucksPayeeIds token budgetId = do
--   r <- asJSON =<< getWith (opts token) (payeesUrl budgetId)
--   findSbuxIds r
--   -- TODO: Handle errors
--   -- putStr $ show ()
--   return ()

-- findStarbucks
-- const getSbuxPayeeIds = compose(
--   pluck('id'),
--   filterName(/starbucks/i),
-- )

findSbuxIds :: Payees -> [String]
findSbuxIds ps = map (name) ps




main :: IO ()
main = do
  token    <- getEnv ("YNAB_ACCESS_TOKEN")
  budgetId <- getEnv ("YNAB_BUDGET_ID")
  payeeIds <- getPayees token budgetId
  return ()
