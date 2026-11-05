import React from 'react';
import { BookOpen, Terminal, Database, Server, Cpu, CheckCircle } from 'lucide-react';

export default function DocsPage() {
  return (
    <div style={{
      height: 'calc(100vh - 52px)',
      overflowY: 'auto',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-main)',
      padding: '36px 48px',
      fontFamily: 'var(--font-sans)',
      lineHeight: 1.6
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
            <BookOpen size={14} />
            Academic Practicals Guide & Reference
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
            Big Data Online Lab Documentation
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Comprehensive laboratory manual, command reference, and architecture guide for Apache Pig, Hadoop MapReduce, and multi-language development.
          </p>
        </div>

        {/* Section 1: Apache Pig */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Database size={20} />
            1. Apache Pig Latin Reference
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            Apache Pig is a high-level dataflow platform for processing massive datasets on Apache Hadoop. Pig Latin abstracts Java MapReduce into clean, relational algebra transformations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ fontSize: '15px', color: '#818cf8', marginBottom: '6px' }}>LOAD & Schema</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginBottom: '8px' }}>Reads structured dataset from storage into a relation with typed schema.</p>
              <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>
{`students = LOAD 'students.csv' 
  USING PigStorage(',') 
  AS (id:int, name:chararray, gpa:float);`}
              </pre>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ fontSize: '15px', color: '#818cf8', marginBottom: '6px' }}>FILTER & FOREACH</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginBottom: '8px' }}>Selects rows by boolean condition and projects specific column expressions.</p>
              <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>
{`honor = FILTER students BY gpa >= 3.7;
report = FOREACH honor GENERATE name, gpa;`}
              </pre>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ fontSize: '15px', color: '#818cf8', marginBottom: '6px' }}>GROUP BY & Aggregation</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginBottom: '8px' }}>Collects records into bags by key and applies COUNT, SUM, AVG, MAX, MIN.</p>
              <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>
{`grp = GROUP students BY major;
stats = FOREACH grp GENERATE group, COUNT(students);`}
              </pre>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ fontSize: '15px', color: '#818cf8', marginBottom: '6px' }}>JOIN & DUMP</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginBottom: '8px' }}>Performs equi-join across datasets and dumps resulting tuples to console.</p>
              <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>
{`joined = JOIN emp BY dept_id, dept BY dept_id;
DUMP joined;`}
              </pre>
            </div>
          </div>
        </section>

        {/* Section 2: Hadoop MapReduce */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Server size={20} />
            2. Hadoop MapReduce Architecture
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            MapReduce is the core processing paradigm of Apache Hadoop for processing multi-terabyte datasets in parallel on commodity hardware clusters.
          </p>

          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
            <h4 style={{ color: '#ffffff', marginBottom: '12px' }}>The 4 Phases of MapReduce:</h4>
            <ol style={{ paddingLeft: '20px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong style={{ color: '#38bdf8' }}>Map Phase:</strong> Input data is split into lines and processed by the Mapper class, producing intermediate <code>(Key, Value)</code> pairs.</li>
              <li><strong style={{ color: '#818cf8' }}>Partitioning:</strong> Hashes output keys to assign records to specific Reducer tasks.</li>
              <li><strong style={{ color: '#fbbf24' }}>Shuffle & Sort:</strong> Hadoop aggregates all values sharing identical keys into an <code>Iterable&lt;Value&gt;</code> sequence sorted by key.</li>
              <li><strong style={{ color: '#34d399' }}>Reduce Phase:</strong> Reducer iterates over grouped values and writes final results to <code>part-r-00000</code> in HDFS.</li>
            </ol>
          </div>
        </section>

        {/* Section 3: Linux Terminal Commands */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Terminal size={20} />
            3. Integrated Linux Terminal Cheatsheet
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            The integrated terminal is attached to your user workspace container with full access to files created in Monaco Editor:
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', border: '1px solid var(--border-color)' }}>Command</th>
                <th style={{ padding: '10px 14px', border: '1px solid var(--border-color)' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)', color: '#34d399' }}>pig program.pig</td>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)' }}>Executes an Apache Pig Latin script through the local MR runtime</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)', color: '#34d399' }}>javac WordCount.java && java WordCount</td>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)' }}>Compiles and runs a Java MapReduce program</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)', color: '#34d399' }}>python script.py</td>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)' }}>Executes a Python analytics script with Pandas & NumPy</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)', color: '#34d399' }}>gcc program.c -o program && ./program</td>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)' }}>Compiles with GCC and runs native executable</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)', color: '#34d399' }}>nano filename.txt</td>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)' }}>Opens or creates a file that syncs directly with Monaco Editor</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)', color: '#34d399' }}>ls -l / cat file.csv</td>
                <td style={{ padding: '8px 14px', border: '1px solid var(--border-color)' }}>Lists workspace files and inspects dataset contents</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

