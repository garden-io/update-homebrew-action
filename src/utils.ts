/*
 * Copyright (C) 2018-2020 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import axios from "axios"
import { createHash } from "crypto"

export async function getUrlChecksum(url: string, algorithm = "sha256") {
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
  })

  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm)

    response.data.on("data", (chunk) => {
      hash.update(chunk)
    })

    response.data.on("end", () => {
      resolve(hash.digest("hex"))
    })

    response.data.on("error", reject)
  })
}
