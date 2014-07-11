<?php

class PijazLogger {

  protected $message = '';

  public function log($message) {
    if (defined('LOGGER')) {
      $logger = LOGGER;
      if (!empty($logger) && !empty($message)) {
        $this->message = $message;
        switch ($logger) {
          case "screen":
            $this->logToScreen();
            break;
          default:
            $this->logToFile();
            break;
        }
      }
    }
  }

  private function logToScreen() {
    echo "$this->message\n";
  }

  private function logToFile() {
    if ($fh = fopen(LOGGER, 'a')) {
      fwrite($fh, "$this->message\n");
      fclose($fh);
    }
  }
}

