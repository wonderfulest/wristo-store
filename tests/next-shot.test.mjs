import test from 'node:test'
import assert from 'node:assert/strict'
import { distanceStats, benchmarkComparison, parseDistances } from '../src/utils/nextShot.ts'
const config = { revision: 0, unit: 'yd', distances: [40,60], mode: 'benchmark', minutes: 0, balls: 10, tolerance: 5 }
const session = (id, at, hits=5, c=config, completed=true) => ({id,startedAt:at,endedAt:at+60,config:c,completed,shots:Array.from({length:10},(_,i)=>[i%2?60:40,i<hits?0:-1])})
test('comparison excludes incomplete or incompatible retests regardless of upload order',()=>{
 const current=session('now',200,8), previous=session('old',100,5)
 const result=benchmarkComparison(current,[session('newer',300,10),session('wrong',190,9,{...config,tolerance:10}),session('early',180,9,config,false),previous])
 assert.equal(result.previous.id,'old'); assert.equal(result.change,30)
 assert.equal(benchmarkComparison({...current,completed:false},[previous]),null)
})
test('distance statistics never mix units or target bands and mark small samples',()=>{
 const stats=distanceStats([session('a',1),session('b',2,5,{...config,unit:'m'})],config)
 assert.equal(stats[0].total,5); assert.equal(stats[0].enough,false)
 assert.equal(distanceStats([session('a',1),session('c',3)],config)[0].enough,true)
})
test('targets reject duplicates, fractions, empty input and out of range',()=>{
 assert.deepEqual(parseDistances('40, 60, 80'),[40,60,80])
 for(const value of ['40,40','0,60','60.5','', '40,,60', '151', '10,20,30,40,50,60,70']) assert.equal(parseDistances(value),null)
})
