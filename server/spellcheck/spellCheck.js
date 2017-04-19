import fs from 'fs';
import dict from './dict';

class SpellCheck {
  constructor(filename) {
    // fs.readFile(__dirname + '/' + filename, (err, data) => {
    //   if (err) {
    //     return console.error(err);
    //   }
    //   this.train(data.toString());
    // });
    this.NWORDS = dict;
  }

  train(trainingText) {
    trainingText = trainingText.toLowerCase();
    let features = trainingText.match(/([a-z]+)/g);
    for (let f in features) {
      let feature = features[f];
      if (!this.NWORDS.hasOwnProperty(feature)) {
        this.NWORDS[feature] = 0;
      }
      this.NWORDS[feature] += 1;
    }
  }

  edits1(word) {
    let edits = new Set(), alphabets = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    let n = word.length;
    for (let i = 0; i < n; i++) {
      let a = word.slice(0, i), b = word.slice(i), c = b.slice(1), d = b.slice(2);
      // delete
      edits.add(a + c);
      // transpose
      if (b.length > 1) {
          edits.add(a + b.charAt(1) + b.charAt(0) + d);
      }
      for (let j = 0; j < alphabets.length; j++) {
          edits.add(a + alphabets[j] + c);//replaces
          edits.add(a + alphabets[j] + b);//inserts
      }
    }
    return edits;
  }

  edits2(edits1Set) {
    let edits = new Set();
    edits1Set.forEach(e1 => {
      this.edits1(e1).forEach(e2 => {
        edits.add(e2);
      });
    });
    return edits;
  }

  known(words) {
    let known = new Set();
    words.forEach(word => {
      if (this.NWORDS.hasOwnProperty(word)) {
        known.add(word);
      }
    });
    return known;
  }

  correct(word) {
    word = word.trim();
    if (word == '') {
      return;
    }
    word = word.toLowerCase();
    let candidates = [];
    if (this.known(new Set([word])).size > 0) {
      return word;
    } else {
      let edits1Set = this.edits1(word);
      let knownSet = this.known(edits1Set);
      knownSet = knownSet.size > 0 ? knownSet : this.known(this.edits2(edits1Set))
      knownSet.forEach(word => {
        candidates.push(word);
      });
    }
    let max = 0;
    console.log(candidates);
    candidates.forEach(candidate => {
      let curr = this.NWORDS[candidate];
      if (curr > max) {
        max = curr;
        word = candidate;
      }
    });
    return word;
  }
}

export default SpellCheck;
