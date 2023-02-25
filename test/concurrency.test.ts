import axios from 'axios'
import Bluebird from 'bluebird'

async function main() {
  const names = [
    'Mot',
    'Hai',
    'Ba',
    'Bon',
    'Nam',
    'Sau',
    'Bay',
    'Tam',
    'Chin',
    'Muoi'
  ]
  await Bluebird.map(names, writeSheetWithLock, { concurrency: names.length })
}

function writeSheet(name: string) {
  return axios({
    url: 'http://localhost:1234/google-sheet/without-locker',
    method: 'POST',
    data: {
      name
    }
  })
}

function writeSheetWithLock(name: string) {
  return axios({
    url: 'http://localhost:1234/google-sheet/with-locker',
    method: 'POST',
    data: {
      name
    }
  })
}

main()
